import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/features/order/api/order.api.ts';
import { orderKeys } from '@/features/order/constant/order-query-key.ts';
import type {
  MyOrderResponse,
  MyOrderData,
} from '@/features/order/types/my-order.response.ts';
import { ApiError } from '@/shared/api/api-error.ts';

export function useGetMyOrders() {
  return useQuery<MyOrderResponse, ApiError, MyOrderData[]>({
    queryKey: orderKeys.myOrders(),
    queryFn: () => orderApi.getMyOrders(),
    staleTime: 1000 * 30,
    select: (response) => response.data.orders,
  });
}
