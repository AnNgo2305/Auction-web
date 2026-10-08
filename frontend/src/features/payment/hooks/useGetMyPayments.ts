import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/features/payment/api/payment.api';
import { paymentKeys } from '@/features/payment/constants/payment-query-key';
import type { MyPaymentsResponse } from '@/features/payment/types/my-payments.response';
import type { MyPaymentData } from '@/features/payment/types/my-payments.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useGetMyPayments() {
  return useQuery<MyPaymentsResponse, ApiResponseError, MyPaymentData[]>({
    queryKey: paymentKeys.myPayments(),
    queryFn: () => paymentApi.getMyPayments(),
    staleTime: 1000 * 30,
    select: (response) => response.data.payments,
  });
}
