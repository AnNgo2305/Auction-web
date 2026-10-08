import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/features/order/api/order.api.ts';
import { orderKeys } from '@/features/order/constant/order-query-key';
import type {
  GetOrderByIdResponse,
  GetOrderByIdData,
} from '@/features/order/types/get-order-by-id.response.ts';
import { ApiError } from '@/shared/api/api-error.ts';

export function useGetOrderById(orderId: string) {
  return useQuery<GetOrderByIdResponse, ApiError, GetOrderByIdData>({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 30,
    select: (response) => response.data,
  });
}
