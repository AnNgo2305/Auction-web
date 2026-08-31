import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_KEYS } from '@common/constants/redis.constant';

@Injectable()
export class TokenBlacklistCacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async isBlacklisted(jti: string): Promise<boolean> {
    const key = REDIS_KEYS.AUTH.BLACKLIST_TOKEN(jti);

    return (await this.redis.exists(key)) === 1;
  }

  async blacklist(jti: string, exp: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;

    if (ttl <= 0) return;

    await this.redis.set(REDIS_KEYS.AUTH.BLACKLIST_TOKEN(jti), '1', 'EX', ttl);
  }
}
