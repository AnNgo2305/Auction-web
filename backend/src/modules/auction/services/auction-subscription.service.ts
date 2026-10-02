import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDIS_KEYS } from '@common/constants/redis.constant';

@Injectable()
export class AuctionSubscriptionService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async subscribe(socketId: string, auctionIds: string[]): Promise<void> {
    if (auctionIds.length === 0) {
      return;
    }

    const pipeline = this.redis.pipeline();

    for (const auctionId of auctionIds) {
      pipeline.sadd(REDIS_KEYS.AUCTION.SUBSCRIBERS(auctionId), socketId);
      pipeline.sadd(REDIS_KEYS.AUCTION.SUBSCRIPTIONS(socketId), auctionId);
    }

    await pipeline.exec();
  }

  async unsubscribe(socketId: string, auctionIds: string[]): Promise<void> {
    if (auctionIds.length === 0) {
      return;
    }

    const pipeline = this.redis.pipeline();

    for (const auctionId of auctionIds) {
      pipeline.srem(REDIS_KEYS.AUCTION.SUBSCRIBERS(auctionId), socketId);
      pipeline.srem(REDIS_KEYS.AUCTION.SUBSCRIPTIONS(socketId), auctionId);
    }

    await pipeline.exec();
  }

  async getSubscribers(auctionId: string): Promise<string[]> {
    return this.redis.smembers(REDIS_KEYS.AUCTION.SUBSCRIBERS(auctionId));
  }

  async getSubscriptions(socketId: string): Promise<string[]> {
    return this.redis.smembers(REDIS_KEYS.AUCTION.SUBSCRIPTIONS(socketId));
  }

  async removeAllSubscriptions(socketId: string): Promise<void> {
    const auctionIds = await this.getSubscriptions(socketId);

    if (auctionIds.length === 0) {
      return;
    }

    const pipeline = this.redis.pipeline();

    for (const auctionId of auctionIds) {
      pipeline.srem(REDIS_KEYS.AUCTION.SUBSCRIBERS(auctionId), socketId);
    }

    pipeline.del(REDIS_KEYS.AUCTION.SUBSCRIPTIONS(socketId));

    await pipeline.exec();
  }
}
