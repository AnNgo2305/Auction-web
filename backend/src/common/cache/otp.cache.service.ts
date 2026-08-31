import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { OtpType } from '@generated/prisma/enums';
import {
  REDIS_CLIENT,
  REDIS_KEYS,
  REDIS_TTL,
} from '@common/constants/redis.constant';

@Injectable()
export class OtpCacheService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async get(userId: string, type: OtpType): Promise<string | null> {
    const key = this.getKey(userId, type);

    return this.redis.get(key);
  }

  async set(userId: string, type: OtpType, code: string): Promise<void> {
    const key = this.getKey(userId, type);
    const ttl = this.getTtl(type);

    await this.redis.set(key, code, 'EX', ttl);
  }

  async delete(userId: string, type: OtpType): Promise<void> {
    const key = this.getKey(userId, type);

    await this.redis.del(key);
  }

  private getKey(userId: string, type: OtpType): string {
    switch (type) {
      case OtpType.VERIFY_EMAIL:
        return REDIS_KEYS.OTP.VERIFY_EMAIL(userId);

      case OtpType.RESET_PASSWORD:
        return REDIS_KEYS.OTP.RESET_PASSWORD(userId);

      default:
        throw new Error('Unsupported OTP type');
    }
  }

  private getTtl(type: OtpType): number {
    switch (type) {
      case OtpType.VERIFY_EMAIL:
        return REDIS_TTL.OTP.VERIFY_EMAIL;

      case OtpType.RESET_PASSWORD:
        return REDIS_TTL.OTP.RESET_PASSWORD;

      default:
        throw new Error('Unsupported OTP type');
    }
  }
}
