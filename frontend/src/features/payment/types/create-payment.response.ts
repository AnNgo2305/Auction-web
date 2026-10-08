import type { ApiResponse } from '@/shared/types/response';

export class CreatePaymentData {
  paymentUrl!: string;
}

export type CreatePaymentResponse = ApiResponse<CreatePaymentData>;
