import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import {
  REDIS_CLIENT,
  REDIS_KEYS,
  REDIS_TTL,
} from '@common/constants/redis.constant';

export type CachedUser = {
  userId: string;
  role: string;
  isVerified: boolean;
  isBanned: boolean;
};

@Injectable()
export class UserCacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async get(userId: string): Promise<CachedUser | null> {
    const key = REDIS_KEYS.USER.USER_ID(userId);
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as CachedUser;
  }

  async set(user: CachedUser): Promise<void> {
    const key = REDIS_KEYS.USER.USER_ID(user.userId);

    await this.redis.set(
      key,
      JSON.stringify(user),
      'EX',
      REDIS_TTL.USER.USER_ID,
    );
  }
}
