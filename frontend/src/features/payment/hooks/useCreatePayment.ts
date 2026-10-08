import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentApi } from '@/features/payment/api/payment.api';
import type { CreatePaymentResponse } from '@/features/payment/types/create-payment.response';
import type { ApiResponseError } from '@/shared/types/error';

interface CreatePaymentVariables {
  orderId: string;
  idempotencyKey: string;
}

export function useCreatePayment() {
  return useMutation<
    CreatePaymentResponse,
    ApiResponseError,
    CreatePaymentVariables
  >({
    mutationFn: async (
      variables: CreatePaymentVariables,
    ): Promise<CreatePaymentResponse> => {
      return await paymentApi.createPayment(
        variables.orderId,
        variables.idempotencyKey,
      );
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create payment.');
    },
  });
}
