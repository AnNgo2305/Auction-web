import { Inject, Injectable } from '@nestjs/common';
import {
  IDEMPOTENCY_STATUS,
  IdempotencyStatus,
  REDIS_CLIENT,
  REDIS_IDEMPOTENCY,
} from '@common/constants/redis.constant';
import Redis from 'ioredis';

interface IdempotencyState {
  status: IdempotencyStatus;
  bidId?: string;
}

@Injectable()
export class BidIdempotencyService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  /**
   * Check whether a bid with the given tempId
   * has already been processed or is currently being processed.
   */
  async getState(
    userId: string,
    auctionId: string,
    tempId: string,
  ): Promise<IdempotencyState | null> {
    const key = this.getKey(userId, auctionId, tempId);
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as IdempotencyState;
  }

  /**
   * Atomically mark a bid as being processed.
   * Returns true if this request acquired the idempotency key.
   */
  async start(
    userId: string,
    auctionId: string,
    tempId: string,
  ): Promise<boolean> {
    const key = this.getKey(userId, auctionId, tempId);

    const state: IdempotencyState = {
      status: IDEMPOTENCY_STATUS.PROCESSING,
    };

    const result = await this.redis.set(
      key,
      JSON.stringify(state),
      'EX',
      REDIS_IDEMPOTENCY.PLACE_BID.TTL,
      'NX',
    );

    return result === 'OK';
  }

  /**
   * Mark the bid as completed and store the created bid ID.
   */
  async complete(
    userId: string,
    auctionId: string,
    tempId: string,
    bidId: string,
  ): Promise<void> {
    const key = this.getKey(userId, auctionId, tempId);

    const state: IdempotencyState = {
      status: IDEMPOTENCY_STATUS.COMPLETED,
      bidId,
    };

    await this.redis.set(
      key,
      JSON.stringify(state),
      'EX',
      REDIS_IDEMPOTENCY.PLACE_BID.TTL,
    );
  }

  /**
   * Remove the idempotency key so the request can be retried.
   * This should be used when bid creation fails.
   */
  async remove(
    userId: string,
    auctionId: string,
    tempId: string,
  ): Promise<void> {
    const key = this.getKey(userId, auctionId, tempId);
    await this.redis.del(key);
  }

  private getKey(userId: string, auctionId: string, tempId: string): string {
    return REDIS_IDEMPOTENCY.PLACE_BID.KEY(userId, auctionId, tempId);
  }
}
