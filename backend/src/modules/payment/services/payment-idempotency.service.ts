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
  paymentUrl?: string;
}

@Injectable()
export class PaymentIdempotencyService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async getState(paymentId: string): Promise<IdempotencyState | null> {
    const value = await this.redis.get(
      REDIS_IDEMPOTENCY.PAYMENT_CALLBACK.KEY(paymentId),
    );

    return value ? (JSON.parse(value) as IdempotencyState) : null;
  }

  async startPaying(paymentId: string): Promise<boolean> {
    const result = await this.redis.set(
      REDIS_IDEMPOTENCY.PAYMENT_CALLBACK.KEY(paymentId),
      JSON.stringify({ status: IDEMPOTENCY_STATUS.PROCESSING }),
      'EX',
      REDIS_IDEMPOTENCY.PAYMENT_CALLBACK.TTL,
      'NX',
    );

    return result === 'OK';
  }

  async completePaying(paymentId: string): Promise<void> {
    await this.redis.set(
      REDIS_IDEMPOTENCY.PAYMENT_CALLBACK.KEY(paymentId),
      JSON.stringify({ status: IDEMPOTENCY_STATUS.COMPLETED }),
      'EX',
      REDIS_IDEMPOTENCY.PAYMENT_CALLBACK.TTL,
    );
  }

  async removePaying(paymentId: string): Promise<void> {
    await this.redis.del(REDIS_IDEMPOTENCY.PAYMENT_CALLBACK.KEY(paymentId));
  }

  async getCreatePaymentState(
    userId: string,
    orderId: string,
    idempotencyKey: string,
  ): Promise<IdempotencyState | null> {
    const value = await this.redis.get(
      REDIS_IDEMPOTENCY.PAYMENT_CREATION.KEY(userId, orderId, idempotencyKey),
    );

    return value ? (JSON.parse(value) as IdempotencyState) : null;
  }

  async startCreatePayment(
    userId: string,
    orderId: string,
    idempotencyKey: string,
  ): Promise<boolean> {
    const result = await this.redis.set(
      REDIS_IDEMPOTENCY.PAYMENT_CREATION.KEY(userId, orderId, idempotencyKey),
      JSON.stringify({
        status: IDEMPOTENCY_STATUS.PROCESSING,
      }),
      'EX',
      REDIS_IDEMPOTENCY.PAYMENT_CREATION.TTL,
      'NX',
    );

    return result === 'OK';
  }

  async completeCreatePayment(
    userId: string,
    orderId: string,
    idempotencyKey: string,
    paymentUrl: string,
  ): Promise<void> {
    await this.redis.set(
      REDIS_IDEMPOTENCY.PAYMENT_CREATION.KEY(userId, orderId, idempotencyKey),
      JSON.stringify({
        status: IDEMPOTENCY_STATUS.COMPLETED,
        paymentUrl,
      }),
      'EX',
      REDIS_IDEMPOTENCY.PAYMENT_CREATION.TTL,
    );
  }

  async removeCreatePayment(
    userId: string,
    orderId: string,
    idempotencyKey: string,
  ): Promise<void> {
    await this.redis.del(
      REDIS_IDEMPOTENCY.PAYMENT_CREATION.KEY(userId, orderId, idempotencyKey),
    );
  }
}
