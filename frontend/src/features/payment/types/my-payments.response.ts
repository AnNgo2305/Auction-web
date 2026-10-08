import type { PaymentStatus } from '@/shared/types/payment-status';
import type { ApiResponse } from '@/shared/types/response';

export class MyPaymentData {
  paymentId!: string;
  orderId!: string;
  amount!: number;
  status!: PaymentStatus;
  transactionRef!: string | null;
  transactionNo!: string | null;
  responseCode!: string | null;
  paidAt!: string | null;
  createdAt!: string;
  updatedAt!: string;
}

export type MyPaymentsResponse = ApiResponse<{
  payments: MyPaymentData[];
}>;
