import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import {
  REDIS_CLIENT,
  REDIS_KEYS,
  REDIS_TTL,
} from '@common/constants/redis.constant';
import {
  ActorSnapshot,
  NotificationPayload,
} from '@modules/notification/constants/notification.constant';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { NotificationDto } from '@modules/notification/dtos/notification.dto';
import { Prisma } from '@generated/prisma/client';
import { GetNotificationsResponseDto } from '@modules/notification/dtos/get-notifications.response.dto';
import { NotificationsGateway } from '@modules/notification/notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  async addAggregationActor(payload: NotificationPayload): Promise<void> {
    const { recipientId, actorId, type, entityId } = payload;

    const key = REDIS_KEYS.NOTIFICATION.AGGREGATION(
      recipientId,
      type,
      entityId,
    );

    const metaKey = REDIS_KEYS.NOTIFICATION.AGGREGATION_META(
      recipientId,
      type,
      entityId,
    );

    const now = Date.now();

    const multi = this.redis.multi();
    multi.zadd(key, now, actorId);

    multi.set(metaKey, now);
    multi.expire(key, REDIS_TTL.NOTIFICATION.AGGREGATION);
    multi.expire(metaKey, REDIS_TTL.NOTIFICATION.AGGREGATION_META);

    await multi.exec();
  }

  async createNotification(
    payload: NotificationPayload,
  ): Promise<NotificationDto | null> {
    const dedupKey = REDIS_KEYS.NOTIFICATION.DEDUP(
      payload.type,
      payload.entityId,
      payload.recipientId,
    );

    const isNew = await this.redis.set(
      dedupKey,
      '1',
      'EX',
      REDIS_TTL.NOTIFICATION.DEDUP,
      'NX',
    );

    if (!isNew) {
      this.logger.warn(`Duplicate notification skipped: ${dedupKey}`);

      return null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        recipientId: payload.recipientId,
        actorId: payload.actorId,
        type: payload.type,
        entityId: payload.entityId,
        entityType: payload.entityType,
        metadata: payload.metadata,
      },
    });

    this.logger.log(`Notification created: ${notification.notificationId}`);

    return notification;
  }

  async refreshUnreadCount(recipientId: string): Promise<number> {
    const key = REDIS_KEYS.NOTIFICATION.UNREAD_COUNT(recipientId);

    this.logger.log(`[REFRESH_UNREAD_COUNT] recipient=${recipientId}`);

    const unreadCount = await this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });

    await this.redis.set(
      key,
      unreadCount,
      'EX',
      REDIS_TTL.NOTIFICATION.UNREAD_COUNT,
    );

    this.logger.log(
      `[REFRESH_UNREAD_COUNT] count=${unreadCount} recipient=${recipientId}`,
    );

    return unreadCount;
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    const key = REDIS_KEYS.NOTIFICATION.UNREAD_COUNT(recipientId);

    this.logger.log(`[GET_UNREAD_COUNT] recipient=${recipientId}`);

    const cachedCount = await this.redis.get(key);

    if (cachedCount !== null) {
      const unreadCount = Number(cachedCount);

      this.logger.log(
        `[GET_UNREAD_COUNT] cache-hit count=${unreadCount} recipient=${recipientId}`,
      );

      return unreadCount;
    }

    this.logger.log(`[GET_UNREAD_COUNT] cache-miss recipient=${recipientId}`);

    return this.refreshUnreadCount(recipientId);
  }

  async getNotifications(
    recipientId: string,
    cursor?: string,
    limit = 10,
  ): Promise<GetNotificationsResponseDto> {
    this.logger.log(
      `[GET_NOTIFICATIONS] recipient=${recipientId} cursor=${cursor ?? 'null'} limit=${limit}`,
    );

    const notifications = await this.prisma.notification.findMany({
      where: {
        recipientId,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          notificationId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        notificationId: 'desc',
      },
      select: {
        notificationId: true,
        recipientId: true,
        actorId: true,
        type: true,
        entityId: true,
        entityType: true,
        metadata: true,
        isRead: true,
        createdAt: true,
        readAt: true,
        actorCount: true,
      },
    });

    const hasMore = notifications.length > limit;
    const sliced = hasMore ? notifications.slice(0, limit) : notifications;

    this.logger.log(
      `[GET_NOTIFICATIONS] found=${sliced.length} hasMore=${hasMore} recipient=${recipientId}`,
    );

    return {
      notifications: sliced,
      nextCursor: hasMore ? sliced[sliced.length - 1].notificationId : null,
    };
  }

  async aggregateNotification(
    payload: NotificationPayload,
  ): Promise<NotificationDto | null> {
    // Build the Redis aggregation key.
    const { recipientId, type, entityId, entityType } = payload;
    const aggregationKey = REDIS_KEYS.NOTIFICATION.AGGREGATION(
      recipientId,
      type,
      entityId,
    );

    // Move the current aggregation buffer to a processing key.
    const processingKey = REDIS_KEYS.NOTIFICATION.AGGREGATION_PROCESSING(
      recipientId,
      type,
      entityId,
    );

    try {
      await this.redis.rename(aggregationKey, processingKey);
    } catch {
      this.logger.warn(`Aggregation buffer not found: ${aggregationKey}`);
      return null;
    }

    // Read all actor IDs from the processing key.
    // If there are no actors, delete the processing key and stop the aggregation process.
    const actorIds = await this.redis.zrange(processingKey, 0, -1);
    if (actorIds.length === 0) {
      await this.redis.del(processingKey);
      return null;
    }

    // Fetch actor information from the database.
    const users = await this.prisma.user.findMany({
      where: {
        userId: {
          in: actorIds,
        },
      },
      select: {
        userId: true,
        username: true,
        profile: {
          select: {
            profileImageUrl: true,
            fullName: true,
          },
        },
      },
    });
    const newActors: ActorSnapshot[] = users.map((user) => ({
      userId: user.userId,
      username: user.username,
      fullName: user.profile?.fullName ?? null,
      profileImageUrl: user.profile?.profileImageUrl ?? null,
    }));

    // Find the existing aggregated notification
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        recipientId,
        type,
        entityId,
        isRead: false,
      },
    });

    // Get the existing actors from the notification metadata.
    const existingActors = this.getNotificationActors(
      existingNotification?.metadata ?? null,
    );

    // Merge the new actors with the existing actors.
    // Keep only the latest three actors for display.
    const mergedActors = this.buildNotificationActors(
      newActors,
      existingActors,
    );

    // Calculate how many actors are truly new.
    const existingActorIds = new Set(
      existingActors.map((actor) => actor.userId),
    );
    const trulyNewCount = actorIds.filter(
      (id) => !existingActorIds.has(id),
    ).length;

    // Create a new notification or update the existing one.
    const latestActorId = actorIds[actorIds.length - 1];
    const shouldIncrementUnread = !existingNotification;

    const notification = existingNotification
      ? await this.prisma.notification.update({
          where: {
            notificationId: existingNotification.notificationId,
          },
          data: {
            actorId: latestActorId,
            actorCount: existingNotification.actorCount + trulyNewCount,
            isRead: false,
            createdAt: new Date(),
            readAt: null,
            metadata: {
              actors: mergedActors,
            } as unknown as Prisma.InputJsonValue,
          },
        })
      : await this.prisma.notification.create({
          data: {
            recipientId,
            actorId: latestActorId,
            actorCount: actorIds.length,
            type,
            entityId,
            entityType,
            metadata: {
              actors: newActors,
            } as unknown as Prisma.InputJsonValue,
          },
        });

    if (shouldIncrementUnread) {
      await this.incrementUnreadCount(recipientId);
    }

    // Delete the processing key and return
    await this.redis.del(processingKey);
    return notification;
  }

  async markAsRead(
    recipientId: string,
    notificationId: string,
  ): Promise<NotificationDto | null> {
    this.logger.log(
      `[MARK_AS_READ] recipient=${recipientId} notification=${notificationId}`,
    );

    const notification = await this.prisma.notification.findFirst({
      where: {
        notificationId,
        recipientId,
      },
    });

    if (!notification) {
      this.logger.warn(
        `[MARK_AS_READ] Notification not found: recipient=${recipientId} notification=${notificationId}`,
      );
      return null;
    }

    if (notification.isRead) {
      this.logger.log(
        `[MARK_AS_READ] Already read: notification=${notificationId}`,
      );
      return notification;
    }

    const updatedNotification = await this.prisma.notification.update({
      where: {
        notificationId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const unreadCount = await this.refreshUnreadCount(recipientId);
    this.notificationGateway.emitUnreadCount(recipientId, unreadCount);
    this.logger.log(`[MARK_AS_READ] Success: notification=${notificationId}`);
    return updatedNotification;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    this.logger.log(`[MARK_ALL_AS_READ] recipient=${recipientId}`);

    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const unreadCount = await this.refreshUnreadCount(recipientId);
    this.notificationGateway.emitUnreadCount(recipientId, unreadCount);

    this.logger.log(
      `[MARK_ALL_AS_READ] updated=${result.count} recipient=${recipientId}`,
    );

    return result.count;
  }

  async deleteOldReadNotifications(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    this.logger.log(
      `[DELETE_OLD_READ_NOTIFICATIONS] cutoff=${cutoffDate.toISOString()}`,
    );

    const result = await this.prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`[DELETE_OLD_READ_NOTIFICATIONS] deleted=${result.count}`);

    return result.count;
  }

  private async incrementUnreadCount(recipientId: string): Promise<void> {
    const key = REDIS_KEYS.NOTIFICATION.UNREAD_COUNT(recipientId);
    const exists = await this.redis.exists(key);

    if (!exists) {
      await this.refreshUnreadCount(recipientId);
      return;
    }

    await this.redis.incr(key);
  }

  private buildNotificationActors(
    newActors: ActorSnapshot[],
    existingActors: ActorSnapshot[],
  ): ActorSnapshot[] {
    const seen = new Set<string>();
    const merged: ActorSnapshot[] = [];

    for (const actor of [...newActors, ...existingActors]) {
      if (seen.has(actor.userId)) continue;
      seen.add(actor.userId);
      merged.push(actor);
    }

    return merged;
  }

  private getNotificationActors(
    metadata: Prisma.JsonValue | null,
  ): ActorSnapshot[] {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return [];
    }

    const actors = metadata.actors;
    if (!Array.isArray(actors)) {
      return [];
    }

    return actors as unknown as ActorSnapshot[];
  }
}
