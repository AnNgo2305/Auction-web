import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { OrderStatus, PaymentStatus } from '@generated/prisma/enums';
import { VnpayService } from './vnpay.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check a pending payment against VNPay
   * when the original callback may have been lost.
   */
  async reconcilePayment(paymentId: string): Promise<void> {
    const serverIp = this.configService.get<string>('vnpay.serverIp')!;

    const payment = await this.prisma.payment.findUnique({
      where: { paymentId },
      select: {
        paymentId: true,
        amount: true,
        status: true,
        transactionRef: true,
        createdAt: true,
      },
    });

    if (!payment || payment.status !== PaymentStatus.PENDING) {
      return;
    }

    const result = await this.vnpayService.queryTransaction({
      txnRef: payment.transactionRef ?? payment.paymentId,
      transactionDate: this.formatVnpayDate(payment.createdAt),
      orderInfo: `Reconcile payment ${payment.paymentId}`,
      ipAddress: serverIp,
    });

    // Query failed; the payment status is still unknown, so keep it PENDING.
    if (result.responseCode !== '00') {
      this.logger.warn(`Payment reconciliation failed: ${paymentId}`);
      return;
    }

    // Query succeeded, but the transaction was not successful at VNPAY.
    // Keep the current status unchanged; failed or canceled transactions are handled separately.
    if (result.transactionStatus !== '00') {
      this.logger.warn(`Payment is not successful at VNPAY: ${paymentId}`);
      return;
    }

    // VNPay amount is represented in the smallest currency unit.
    const expectedAmount = Number(payment.amount) * 100;

    if (Number(result.amount) !== expectedAmount) {
      this.logger.error(
        `Payment amount mismatch during reconciliation: ${paymentId}`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT payment_id
        FROM payments
        WHERE payment_id = ${paymentId}
        FOR UPDATE
      `;

      const currentPayment = await tx.payment.findUnique({
        where: { paymentId },
        select: {
          status: true,
          orderId: true,
        },
      });

      if (!currentPayment || currentPayment.status !== PaymentStatus.PENDING) {
        return;
      }

      await tx.payment.update({
        where: { paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          transactionNo: result.transactionNo,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { orderId: currentPayment.orderId },
        data: {
          status: OrderStatus.PAID,
        },
      });
    });

    this.logger.log(`Payment reconciled successfully: ${paymentId}`);
  }

  private formatVnpayDate(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);

    const values = Object.fromEntries(
      parts
        .filter(({ type }) => type !== 'literal')
        .map(({ type, value }) => [type, value]),
    );

    return (
      `${values.year}${values.month}${values.day}` +
      `${values.hour}${values.minute}${values.second}`
    );
  }
}
