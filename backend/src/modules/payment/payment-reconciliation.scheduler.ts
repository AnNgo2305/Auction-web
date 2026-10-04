import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { PaymentStatus } from '@generated/prisma/enums';
import { PaymentReconciliationService } from './services/payment-reconciliation.service';

@Injectable()
export class PaymentReconciliationScheduler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly paymentReconciliationService: PaymentReconciliationService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async reconcilePendingPayments(): Promise<void> {
    const threshold = new Date(Date.now() - 10 * 60 * 1000);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: {
          lte: threshold,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 50,
      select: {
        paymentId: true,
      },
    });

    if (payments.length === 0) {
      return;
    }

    this.logger.log(
      `Found ${payments.length} pending payments for reconciliation`,
    );

    for (const payment of payments) {
      try {
        await this.paymentReconciliationService.reconcilePayment(
          payment.paymentId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to reconcile payment: ${payment.paymentId}`,
          error,
        );
      }
    }
  }
}
