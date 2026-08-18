import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  REDIS_CLIENT,
  REDIS_KEYS,
  REDIS_TTL,
} from '@common/constants/redis.constant';
import Redis from 'ioredis';
import { PrismaService } from '@common/services/prisma.service';

@Injectable()
export class PresenceService implements OnModuleInit, OnModuleDestroy {
  private readonly pendingLastSeen = new Map<string, Date>();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.flushTimer = setInterval(() => {
      void this.flushLastSeenToDb();
    }, 60_000).unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    await this.flushLastSeenToDb();
  }

  async markOnline(
    userId: string,
    socketId: string,
  ): Promise<{ becameOnline: boolean }> {
    const wasOnline =
      (await this.redis.sismember(REDIS_KEYS.PRESENCE.ONLINE_USERS, userId)) ===
      1;

    const pipeline = this.redis.pipeline();
    pipeline.sadd(REDIS_KEYS.PRESENCE.ONLINE_USERS, userId);
    pipeline.sadd(REDIS_KEYS.PRESENCE.USER_SOCKETS(userId), socketId);

    pipeline.expire(
      REDIS_KEYS.PRESENCE.USER_SOCKETS(userId),
      REDIS_TTL.PRESENCE.USER_SOCKETS,
    );
    pipeline.set(
      REDIS_KEYS.PRESENCE.HEARTBEAT(socketId),
      userId,
      'EX',
      REDIS_TTL.PRESENCE.HEARTBEAT,
    );

    pipeline.del(REDIS_KEYS.PRESENCE.LAST_SEEN(userId));

    await pipeline.exec();
    this.pendingLastSeen.delete(userId);

    return {
      becameOnline: !wasOnline,
    };
  }

  async markOffline(
    userId: string,
    socketId: string,
  ): Promise<{
    isOffline: boolean;
    lastSeen: Date | null;
  }> {
    const pipeline = this.redis.pipeline();
    pipeline.srem(REDIS_KEYS.PRESENCE.USER_SOCKETS(userId), socketId);
    pipeline.del(REDIS_KEYS.PRESENCE.HEARTBEAT(socketId));
    pipeline.scard(REDIS_KEYS.PRESENCE.USER_SOCKETS(userId));

    const results = await pipeline.exec();
    const remainingSockets = (results?.[2]?.[1] as number) ?? 0;
    if (remainingSockets > 0) {
      return {
        isOffline: false,
        lastSeen: null,
      };
    }

    const lastSeen = new Date();
    const offlinePipeline = this.redis.pipeline();
    offlinePipeline.srem(REDIS_KEYS.PRESENCE.ONLINE_USERS, userId);
    offlinePipeline.set(
      REDIS_KEYS.PRESENCE.LAST_SEEN(userId),
      lastSeen.toISOString(),
      'EX',
      REDIS_TTL.PRESENCE.LAST_SEEN,
    );

    await offlinePipeline.exec();
    this.pendingLastSeen.set(userId, lastSeen);
    return {
      isOffline: true,
      lastSeen,
    };
  }

  async refreshHeartbeat(userId: string, socketId: string): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.expire(
      REDIS_KEYS.PRESENCE.HEARTBEAT(socketId),
      REDIS_TTL.PRESENCE.HEARTBEAT,
    );
    pipeline.expire(
      REDIS_KEYS.PRESENCE.USER_SOCKETS(userId),
      REDIS_TTL.PRESENCE.USER_SOCKETS,
    );
    pipeline.sadd(REDIS_KEYS.PRESENCE.ONLINE_USERS, userId);
    await pipeline.exec();
  }

  async getOnlineUsers(userIds: string[]): Promise<Map<string, boolean>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const results = await this.redis.smismember(
      REDIS_KEYS.PRESENCE.ONLINE_USERS,
      ...userIds,
    );

    const onlineMap = new Map<string, boolean>();
    userIds.forEach((userId, index) => {
      onlineMap.set(userId, results[index] === 1);
    });

    return onlineMap;
  }

  async getLastSeen(userId: string): Promise<Date | null> {
    const lastSeen = await this.redis.get(
      REDIS_KEYS.PRESENCE.LAST_SEEN(userId),
    );
    if (!lastSeen) {
      return null;
    }
    return new Date(lastSeen);
  }

  async getLastSeenBulk(userIds: string[]): Promise<Map<string, Date | null>> {
    if (userIds.length === 0) {
      return new Map();
    }
    const pipeline = this.redis.pipeline();
    for (const userId of userIds) {
      pipeline.get(REDIS_KEYS.PRESENCE.LAST_SEEN(userId));
    }
    const results = await pipeline.exec();
    const lastSeenMap = new Map<string, Date | null>();
    userIds.forEach((userId, index) => {
      const value = results?.[index]?.[1] as string | null;
      lastSeenMap.set(userId, value ? new Date(value) : null);
    });

    return lastSeenMap;
  }

  async getPresenceSnapshot(userIds: string[]): Promise<{
    onlineMap: Map<string, boolean>;
    lastSeenMap: Map<string, Date | null>;
  }> {
    if (userIds.length === 0) {
      return {
        onlineMap: new Map(),
        lastSeenMap: new Map(),
      };
    }

    const [onlineMap, lastSeenMap] = await Promise.all([
      this.getOnlineUsers(userIds),
      this.getLastSeenBulk(userIds),
    ]);

    return {
      onlineMap,
      lastSeenMap,
    };
  }

  async reconcile(liveSocketsByUser: Map<string, string[]>): Promise<{
    becameOffline: string[];
    becameOnline: string[];
  }> {
    const onlineNow = await this.redis.smembers(
      REDIS_KEYS.PRESENCE.ONLINE_USERS,
    );

    const liveUserIds = new Set(liveSocketsByUser.keys());
    const becameOffline = onlineNow.filter(
      (userId) => !liveUserIds.has(userId),
    );
    const becameOnline = [...liveUserIds].filter(
      (userId) => !onlineNow.includes(userId),
    );

    const pipeline = this.redis.pipeline();
    if (becameOffline.length > 0) {
      pipeline.srem(REDIS_KEYS.PRESENCE.ONLINE_USERS, ...becameOffline);

      const now = new Date();
      for (const userId of becameOffline) {
        pipeline.set(
          REDIS_KEYS.PRESENCE.LAST_SEEN(userId),
          now.toISOString(),
          'EX',
          REDIS_TTL.PRESENCE.LAST_SEEN,
        );

        pipeline.del(REDIS_KEYS.PRESENCE.USER_SOCKETS(userId));
        this.pendingLastSeen.set(userId, now);
      }
    }

    if (becameOnline.length > 0) {
      pipeline.sadd(REDIS_KEYS.PRESENCE.ONLINE_USERS, ...becameOnline);
      for (const userId of becameOnline) {
        this.pendingLastSeen.delete(userId);
      }
    }

    await pipeline.exec();
    return {
      becameOffline,
      becameOnline,
    };
  }

  async subscribe(watcherId: string, targetUserIds: string[]): Promise<void> {
    const userIds = targetUserIds.filter((userId) => userId !== watcherId);
    if (userIds.length === 0) {
      return;
    }

    const pipeline = this.redis.pipeline();

    for (const targetUserId of userIds) {
      pipeline.sadd(REDIS_KEYS.PRESENCE.WATCHERS(targetUserId), watcherId);
      pipeline.sadd(REDIS_KEYS.PRESENCE.WATCHING(watcherId), targetUserId);
    }

    await pipeline.exec();
  }

  async unsubscribe(watcherId: string, targetUserIds: string[]): Promise<void> {
    if (targetUserIds.length === 0) {
      return;
    }

    const pipeline = this.redis.pipeline();
    for (const targetUserId of targetUserIds) {
      pipeline.srem(REDIS_KEYS.PRESENCE.WATCHERS(targetUserId), watcherId);
      pipeline.srem(REDIS_KEYS.PRESENCE.WATCHING(watcherId), targetUserId);
    }

    await pipeline.exec();
  }

  async getWatchers(targetUserId: string): Promise<string[]> {
    return this.redis.smembers(REDIS_KEYS.PRESENCE.WATCHERS(targetUserId));
  }

  async removeWatching(userId: string): Promise<void> {
    await this.redis.del(REDIS_KEYS.PRESENCE.WATCHING(userId));
  }

  private async flushLastSeenToDb(): Promise<void> {
    if (this.pendingLastSeen.size === 0) return;

    const batch = new Map(this.pendingLastSeen);
    this.pendingLastSeen.clear();

    try {
      await this.prisma.$transaction(
        [...batch.entries()].map(([userId, lastActiveAt]) =>
          this.prisma.user.update({
            where: { userId },
            data: { lastActiveAt },
          }),
        ),
      );
    } catch {
      for (const [userId, ts] of batch) {
        if (!this.pendingLastSeen.has(userId)) {
          this.pendingLastSeen.set(userId, ts);
        }
      }
    }
  }
}
