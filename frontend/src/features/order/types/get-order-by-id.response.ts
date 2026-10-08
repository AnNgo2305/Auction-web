import type { OrderStatus } from '@/shared/types/order-status';
import type { PaymentStatus } from '@/shared/types/payment-status';
import type { ApiResponse } from '@/shared/types/response.ts';

export class OrderProductResponse {
  productId!: string;
  name!: string;
  quantity!: number;
}

export class OrderPaymentResponse {
  paymentId!: string;
  status!: PaymentStatus;
  amount!: number;
  transactionRef!: string | null;
  transactionNo!: string | null;
  responseCode!: string | null;
  paidAt!: string | null;
  createdAt!: string;
}

export class GetOrderByIdData {
  orderId!: string;
  orderCode!: string;
  auctionId!: string;
  buyerId!: string;
  totalAmount!: number;
  status!: OrderStatus;
  products!: OrderProductResponse[];
  payments!: OrderPaymentResponse[];
  createdAt!: string;
  updatedAt!: string;
}

export type GetOrderByIdResponse = ApiResponse<GetOrderByIdData>;

