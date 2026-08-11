import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { THROTTLER_REDIS } from '@common/constants/redis.constant';

@Injectable()
export class RedisThrottlerStorageService
  implements ThrottlerStorage, OnModuleDestroy
{
  private readonly luaScript = `
    local key = KEYS[1]

    local windowStart = tonumber(ARGV[1])
    local now = tonumber(ARGV[2])
    local memberId = ARGV[3]
    local ttl = tonumber(ARGV[4])
    local limit = tonumber(ARGV[5])

    -- Remove requests outside the current sliding window.
    redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)

    -- Add the current request.
    redis.call('ZADD', key, now, memberId)

    -- Count requests inside the window.
    local totalHits = redis.call('ZCARD', key)

    -- Keep the Redis key alive for the duration of the window.
    redis.call('PEXPIRE', key, ttl)

    local timeToExpire = redis.call('PTTL', key)

    -- Reject the current request if the limit is exceeded.
    if totalHits > limit then
      redis.call('ZREM', key, memberId)
      totalHits = totalHits - 1

      return {
        totalHits,
        timeToExpire,
        1
      }
    end

    return {
      totalHits,
      timeToExpire,
      0
    }
  `;

  constructor(
    @Inject(THROTTLER_REDIS)
    private readonly redis: Redis,
  ) {
    this.redis.defineCommand('throttlerSlidingWindow', {
      numberOfKeys: 1,
      lua: this.luaScript,
    });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    _throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const now = Date.now();
    const windowStart = now - ttl;
    const memberId = `${now}-${randomUUID()}`;

    const redisKey = `throttle:${key}`;

    const result = await (
      this.redis as Redis & {
        throttlerSlidingWindow: (
          key: string,
          windowStart: number,
          now: number,
          memberId: string,
          ttl: number,
          limit: number,
        ) => Promise<number[]>;
      }
    ).throttlerSlidingWindow(redisKey, windowStart, now, memberId, ttl, limit);

    const [totalHits, timeToExpire, isBlocked] = result;

    return {
      totalHits,
      timeToExpire,
      isBlocked: isBlocked === 1,
      timeToBlockExpire: isBlocked === 1 ? blockDuration : 0,
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
