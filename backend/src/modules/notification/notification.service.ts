import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@common/constants/redis.constant';
import {
  ActorSnapshot,
  AGGREGATION_TTL_SECONDS,
  NOTIFICATION_DEDUP_TTL_SECONDS,
  NotificationPayload,
} from '@modules/notification/notification.constant';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { NotificationDto } from '@modules/notification/dtos/notification.dto';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private getAggregationKey(
    recipientId: string,
    type: string,
    entityId: string,
  ): string {
    return `notification:aggregation:${recipientId}:${type}:${entityId}`;
  }

  private getAggregationActorMetaKey(
    recipientId: string,
    type: string,
    entityId: string,
  ): string {
    return `${this.getAggregationKey(recipientId, type, entityId)}:actors`;
  }

  private getAggregationMetaKey(
    recipientId: string,
    type: string,
    entityId: string,
  ): string {
    return `${this.getAggregationKey(recipientId, type, entityId)}:meta`;
  }

  private getDedupKey(payload: NotificationPayload): string {
    return `notification:dedup:${payload.type}:${payload.entityId}:${payload.recipientId}`;
  }

  async addAggregationActor(payload: NotificationPayload): Promise<void> {
    const { recipientId, actorId, type, entityId, metadata } = payload;

    const key = this.getAggregationKey(recipientId, type, entityId);
    const actorMetaKey = this.getAggregationActorMetaKey(
      recipientId,
      type,
      entityId,
    );
    const metaKey = this.getAggregationMetaKey(recipientId, type, entityId);

    const now = Date.now();
    const messageId =
      metadata &&
      typeof metadata === 'object' &&
      !Array.isArray(metadata) &&
      'messageId' in metadata &&
      typeof metadata.messageId === 'string'
        ? metadata.messageId
        : undefined;

    const multi = this.redis.multi();
    multi.zadd(key, now, actorId);
    if (messageId) {
      multi.hset(actorMetaKey, actorId, messageId);
    }

    multi.set(metaKey, now);
    multi.expire(key, AGGREGATION_TTL_SECONDS);
    multi.expire(actorMetaKey, AGGREGATION_TTL_SECONDS);
    multi.expire(metaKey, AGGREGATION_TTL_SECONDS);

    await multi.exec();
  }

  async createNotification(
    payload: NotificationPayload,
  ): Promise<NotificationDto | null> {
    const dedupKey = this.getDedupKey(payload);

    const isNew = await this.redis.set(
      dedupKey,
      '1',
      'EX',
      NOTIFICATION_DEDUP_TTL_SECONDS,
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

  async aggregateNotification(
    payload: NotificationPayload,
  ): Promise<NotificationDto | null> {
    // Build the Redis aggregation key.
    const { recipientId, type, entityId, entityType } = payload;
    const aggregationKey = this.getAggregationKey(recipientId, type, entityId);
    const actorMetaKey = this.getAggregationActorMetaKey(
      recipientId,
      type,
      entityId,
    );

    // Move the current aggregation buffer to a processing key.
    const processingKey = `${aggregationKey}:processing`;
    const processingActorMetaKey = `${actorMetaKey}:processing`;
    try {
      await this.redis.rename(aggregationKey, processingKey);
      await this.redis.rename(actorMetaKey, processingActorMetaKey);
    } catch {
      this.logger.warn(`Aggregation buffer not found: ${aggregationKey}`);
      return null;
    }

    // Read all actor IDs from the processing key.
    // If there are no actors, delete the processing key and stop the aggregation process.
    const actorIds = await this.redis.zrange(processingKey, 0, -1);
    const actorMessageIds = await this.redis.hgetall(processingActorMetaKey);
    if (actorIds.length === 0) {
      await this.redis.del(processingKey, processingActorMetaKey);
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
      messageId: actorMessageIds[user.userId],
    }));

    // Find the existing aggregated notification
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        recipientId,
        type,
        entityId,
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
              actors: mergedActors,
            } as unknown as Prisma.InputJsonValue,
          },
        });

    // Delete the processing key and return
    await this.redis.del(processingKey, processingActorMetaKey);
    return notification;
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
