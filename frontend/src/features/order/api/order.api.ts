import { api } from '@/shared/api/axios';
import type { MyOrderResponse } from '@/features/order/types/my-order.response';
import type { GetOrderByIdResponse } from '@/features/order/types/get-order-by-id.response';

const ORDER_API_PREFIX = '/orders';

export const orderApi = {
  getMyOrders: async (): Promise<MyOrderResponse> => {
    const res = await api.get<MyOrderResponse>(`${ORDER_API_PREFIX}/me`);
    return res.data;
  },

  getOrderById: async (orderId: string): Promise<GetOrderByIdResponse> => {
    const res = await api.get<GetOrderByIdResponse>(
      `${ORDER_API_PREFIX}/${orderId}`,
    );
    return res.data;
  },
};
