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
  messageId?: string;
}

@Injectable()
export class MessageIdempotencyService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  /**
   * Check whether a message with the given tempId
   * has already been processed or is currently being processed.
   */
  async getState(
    userId: string,
    tempId: string,
  ): Promise<IdempotencyState | null> {
    const key = this.getKey(userId, tempId);
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as IdempotencyState;
  }

  /**
   * Atomically mark a message as being processed.
   * Returns true if this request acquired the idempotency key.
   */
  async start(userId: string, tempId: string): Promise<boolean> {
    const key = this.getKey(userId, tempId);

    const state: IdempotencyState = {
      status: IDEMPOTENCY_STATUS.PROCESSING,
    };

    const result = await this.redis.set(
      key,
      JSON.stringify(state),
      'EX',
      REDIS_IDEMPOTENCY.SEND_MESSAGE.TTL,
      'NX',
    );

    return result === 'OK';
  }

  /**
   * Mark the message as completed and store the created message ID.
   */
  async complete(
    userId: string,
    tempId: string,
    messageId: string,
  ): Promise<void> {
    const key = this.getKey(userId, tempId);

    const state: IdempotencyState = {
      status: IDEMPOTENCY_STATUS.COMPLETED,
      messageId,
    };

    await this.redis.set(
      key,
      JSON.stringify(state),
      'EX',
      REDIS_IDEMPOTENCY.SEND_MESSAGE.TTL,
    );
  }

  /**
   * Remove the idempotency key so the request can be retried.
   * This should be used when message creation fails.
   */
  async remove(userId: string, tempId: string): Promise<void> {
    const key = this.getKey(userId, tempId);
    await this.redis.del(key);
  }

  private getKey(userId: string, tempId: string): string {
    return REDIS_IDEMPOTENCY.SEND_MESSAGE.KEY(userId, tempId);
  }
}
