import { Inject, Injectable } from '@nestjs/common';
import {
  REDIS_CLIENT,
  REDIS_RATE_LIMIT,
} from '@common/constants/redis.constant';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async checkSendMessage(userId: string): Promise<boolean> {
    const config = REDIS_RATE_LIMIT.SEND_MESSAGE;
    const key = config.KEY(userId);

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, config.WINDOW);
    }

    return count <= config.LIMIT;
  }

  async checkTyping(userId: string): Promise<boolean> {
    const config = REDIS_RATE_LIMIT.TYPING;
    const key = config.KEY(userId);

    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, config.WINDOW);
    }

    return count <= config.LIMIT;
  }
}
