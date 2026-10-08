import type { OrderStatus } from '@/shared/types/order-status';
import type { ApiResponse } from '@/shared/types/response';

export class MyOrderData {
  orderId!: string;
  orderCode!: string;
  auctionId!: string;
  auctionTitle!: string;
  totalAmount!: number;
  status!: OrderStatus;
  createdAt!: string;
  updatedAt!: string;
}

export type MyOrderResponse = ApiResponse<{ orders: MyOrderData[] }>;
