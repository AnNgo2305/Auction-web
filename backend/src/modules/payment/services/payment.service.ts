import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { OrderStatus, PaymentStatus } from '@generated/prisma/enums';
import {
  ERROR_ORDER_INVALID_STATUS,
  ERROR_ORDER_NOT_FOUND,
} from '@modules/order/order.constant';
import {
  ERROR_PAYMENT_AMOUNT_MISMATCH,
  ERROR_PAYMENT_CREATION_IN_PROGRESS,
  ERROR_PAYMENT_INVALID_SIGNATURE,
  ERROR_PAYMENT_NOT_FOUND,
} from '@modules/payment/payment.constant';
import { VnpayService } from './vnpay.service';
import { PaymentIdempotencyService } from '@modules/payment/services/payment-idempotency.service';
import { IDEMPOTENCY_STATUS } from '@common/constants/redis.constant';
import { Prisma } from '@generated/prisma/client';
import { PaymentResult } from '@modules/payment/dtos/payment.response.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly vnpayService: VnpayService,
    private readonly paymentIdempotencyService: PaymentIdempotencyService,
  ) {}

  /**
   * Create payment.
   */
  async createPayment(
    orderId: string,
    userId: string,
    ipAddress: string,
    idempotencyKey: string,
  ): Promise<{ paymentUrl: string }> {
    this.logger.log(`Creating payment for order: ${orderId}, user: ${userId}`);

    const order = await this.prisma.order.findUnique({
      where: { orderId },
      select: {
        orderId: true,
        orderCode: true,
        buyerId: true,
        totalAmount: true,
        status: true,
      },
    });

    if (!order || order.buyerId !== userId) {
      this.logger.warn(
        `Order not found or unauthorized: ${orderId}, user: ${userId}`,
      );
      throw new NotFoundException(ERROR_ORDER_NOT_FOUND);
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(
        `Order ${orderId} cannot be paid with status ${order.status}`,
      );
      throw new BadRequestException(ERROR_ORDER_INVALID_STATUS);
    }

    const existingState =
      await this.paymentIdempotencyService.getCreatePaymentState(
        userId,
        orderId,
        idempotencyKey,
      );

    if (existingState?.status === IDEMPOTENCY_STATUS.COMPLETED) {
      return {
        paymentUrl: existingState.paymentUrl!,
      };
    }

    const startedCreatePayment =
      await this.paymentIdempotencyService.startCreatePayment(
        userId,
        orderId,
        idempotencyKey,
      );

    if (!startedCreatePayment) {
      throw new ConflictException(ERROR_PAYMENT_CREATION_IN_PROGRESS);
    }

    try {
      const payment = await this.getOrCreatePendingPayment(
        order.orderId,
        order.totalAmount,
      );

      const paymentUrl = this.vnpayService.createPaymentUrl({
        txnRef: payment.paymentId,
        amount: Number(payment.amount),
        orderInfo: `Paying for ${order.orderCode} order`,
        ipAddress,
      });

      await this.paymentIdempotencyService.completeCreatePayment(
        userId,
        orderId,
        idempotencyKey,
        paymentUrl,
      );

      return { paymentUrl };
    } catch (error) {
      await this.paymentIdempotencyService.removeCreatePayment(
        userId,
        orderId,
        idempotencyKey,
      );

      throw error;
    }
  }

  /**
   * Handle VNPay IPN/return callback.
   */
  async handleVnpayCallback(params: Record<string, string>): Promise<boolean> {
    const paymentId = params.vnp_TxnRef;
    this.logger.log(`Processing VNPay callback: ${paymentId}`);

    const isValid = this.vnpayService.verifyPayment(params);
    if (!isValid) {
      this.logger.warn(`Invalid VNPay signature: ${paymentId}`);
      throw new BadRequestException(ERROR_PAYMENT_INVALID_SIGNATURE);
    }

    const idempotencyState =
      await this.paymentIdempotencyService.getState(paymentId);

    if (idempotencyState?.status === IDEMPOTENCY_STATUS.COMPLETED) {
      this.logger.log(`Duplicate VNPay callback ignored: ${paymentId}`);
      return true;
    }

    const started = await this.paymentIdempotencyService.startPaying(paymentId);

    if (!started) {
      this.logger.log(
        `VNPay callback is already being processed: ${paymentId}`,
      );
      return true;
    }

    const responseCode = params.vnp_ResponseCode;
    const amount = Number(params.vnp_Amount) / 100;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Lock the payment row so concurrent callbacks are serialized at the database level.
        await tx.$queryRaw`
        SELECT payment_id
        FROM payments
        WHERE payment_id = ${paymentId}
        FOR UPDATE
      `;

        const payment = await tx.payment.findUnique({
          where: { paymentId },
          select: {
            paymentId: true,
            orderId: true,
            amount: true,
            status: true,
          },
        });

        if (!payment) {
          throw new NotFoundException(ERROR_PAYMENT_NOT_FOUND);
        }

        if (Number(payment.amount) !== amount) {
          this.logger.warn(
            `Payment amount mismatch for ${paymentId}. ` +
              `Expected: ${payment.amount.toNumber()}, Received: ${amount}`,
          );

          throw new BadRequestException(ERROR_PAYMENT_AMOUNT_MISMATCH);
        }

        if (payment.status === PaymentStatus.SUCCESS) {
          return true;
        }

        if (responseCode !== '00') {
          await this.failPayment(tx, paymentId, params);
          return false;
        }

        await this.completePayment(tx, paymentId, payment.orderId, params);
        return true;
      });

      await this.paymentIdempotencyService.completePaying(paymentId);

      if (result) {
        this.logger.log(`Payment completed successfully: ${paymentId}`);
      } else {
        this.logger.warn(
          `VNPay payment failed: ${paymentId}, responseCode=${responseCode}`,
        );
      }

      return result;
    } catch (error) {
      await this.paymentIdempotencyService.removePaying(paymentId);
      throw error;
    }
  }

  async getMyPayments(userId: string): Promise<PaymentResult[]> {
    const payments = await this.prisma.payment.findMany({
      where: {
        order: {
          buyerId: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        paymentId: true,
        orderId: true,
        amount: true,
        status: true,
        transactionRef: true,
        transactionNo: true,
        responseCode: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return payments.map((payment) => ({
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.amount.toNumber(),
      status: payment.status,
      transactionRef: payment.transactionRef,
      transactionNo: payment.transactionNo,
      responseCode: payment.responseCode,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }));
  }

  private async getOrCreatePendingPayment(
    orderId: string,
    amount: Prisma.Decimal,
  ): Promise<PaymentResult> {
    return this.prisma.$transaction(async (tx) => {
      // Lock the order row to serialize payment creation
      // and order status changes.
      await tx.$queryRaw`
      SELECT order_id
      FROM orders
      WHERE order_id = ${orderId}
      FOR UPDATE
    `;

      const order = await tx.order.findUnique({
        where: { orderId },
        select: {
          status: true,
        },
      });

      if (!order || order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(ERROR_ORDER_INVALID_STATUS);
      }

      const existingPayment = await tx.payment.findFirst({
        where: {
          orderId,
          status: PaymentStatus.PENDING,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          paymentId: true,
          amount: true,
        },
      });

      if (existingPayment) {
        return {
          paymentId: existingPayment.paymentId,
          amount: existingPayment.amount.toNumber(),
        };
      }

      const payment = await tx.payment.create({
        data: {
          orderId,
          amount,
          status: PaymentStatus.PENDING,
        },
        select: {
          paymentId: true,
          amount: true,
        },
      });

      return {
        paymentId: payment.paymentId,
        amount: payment.amount.toNumber(),
      };
    });
  }

  private async completePayment(
    tx: Prisma.TransactionClient,
    paymentId: string,
    orderId: string,
    params: Record<string, string>,
  ): Promise<void> {
    await tx.payment.update({
      where: { paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionRef: params.vnp_TxnRef,
        transactionNo: params.vnp_TransactionNo,
        responseCode: params.vnp_ResponseCode,
        paidAt: new Date(),
      },
    });

    await tx.order.update({
      where: { orderId },
      data: {
        status: OrderStatus.PAID,
      },
    });
  }

  private async failPayment(
    tx: Prisma.TransactionClient,
    paymentId: string,
    params: Record<string, string>,
  ): Promise<void> {
    await tx.payment.update({
      where: { paymentId },
      data: {
        status: PaymentStatus.FAILED,
        transactionRef: params.vnp_TxnRef,
        transactionNo: params.vnp_TransactionNo,
        responseCode: params.vnp_ResponseCode,
      },
    });
  }
}
