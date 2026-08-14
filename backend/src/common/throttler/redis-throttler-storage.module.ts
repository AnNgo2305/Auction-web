import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import redisConfig from '@common/config/redis.config';
import { THROTTLER_REDIS } from '@common/constants/redis.constant';
import { RedisThrottlerStorageService } from './redis-throttler-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    RedisThrottlerStorageService,
    {
      provide: THROTTLER_REDIS,
      inject: [redisConfig.KEY],
      useFactory: (redis: ConfigType<typeof redisConfig>): Redis => {
        return new Redis({
          host: redis.host,
          port: redis.port,
          password: redis.password,
          db: redis.db,
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 10) {
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        });
      },
    },
  ],
  exports: [RedisThrottlerStorageService],
})
export class RedisThrottlerStorageModule {}
