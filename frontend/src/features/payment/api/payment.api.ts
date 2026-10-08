import { api } from '@/shared/api/axios';
import type { CreatePaymentResponse } from '@/features/payment/types/create-payment.response';
import type { MyPaymentsResponse } from '@/features/payment/types/my-payments.response';

const PAYMENT_API_PREFIX = '/payments';

export const paymentApi = {
  createPayment: async (
    orderId: string,
    idempotencyKey: string,
  ): Promise<CreatePaymentResponse> => {
    const res = await api.post<CreatePaymentResponse>(
      `${PAYMENT_API_PREFIX}/${orderId}`,
      undefined,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      },
    );

    return res.data;
  },

  getMyPayments: async (): Promise<MyPaymentsResponse> => {
    const res = await api.get<MyPaymentsResponse>(`${PAYMENT_API_PREFIX}/me`);

    return res.data;
  },
};
