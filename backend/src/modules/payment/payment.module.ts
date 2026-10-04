import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { VnpayService } from './services/vnpay.service';
import { PaymentIdempotencyService } from './services/payment-idempotency.service';
import { PaymentReconciliationService } from './services/payment-reconciliation.service';
import { PaymentReconciliationScheduler } from './payment-reconciliation.scheduler';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    VnpayService,
    PaymentIdempotencyService,
    PaymentReconciliationService,
    PaymentReconciliationScheduler,
  ],
  exports: [PaymentService, VnpayService, PaymentReconciliationService],
})
export class PaymentModule {}
