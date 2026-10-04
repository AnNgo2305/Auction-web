import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '@generated/prisma/enums';

export class OrderProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'MacBook Pro M4',
  })
  name!: string;

  @ApiProperty({
    description: 'Quantity of the product included in the order',
    example: 1,
  })
  quantity!: number;
}

export class OrderPaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  paymentId!: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.SUCCESS,
  })
  status!: PaymentStatus;

  @ApiProperty({
    description: 'Payment amount',
    example: 22500000,
  })
  amount!: number;

  @ApiProperty({
    description: 'VNPay transaction reference',
    nullable: true,
    example: 'ORDER_1727000000',
  })
  transactionRef!: string | null;

  @ApiProperty({
    description: 'VNPay transaction number',
    nullable: true,
    example: '14567890',
  })
  transactionNo!: string | null;

  @ApiProperty({
    description: 'VNPay response code',
    nullable: true,
    example: '00',
  })
  responseCode!: string | null;

  @ApiProperty({
    description: 'Payment completion timestamp',
    nullable: true,
    example: '2026-09-27T08:30:00.000Z',
  })
  paidAt!: Date | null;

  @ApiProperty({
    description: 'Payment creation timestamp',
    example: '2026-09-27T08:15:00.000Z',
  })
  createdAt!: Date;
}

export class GetOrderByIdResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '550e8400-e29b-41d4-a716-446655440005',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Unique order code',
    example: 'ORD-1727000000-A1B2C3',
  })
  orderCode!: string;

  @ApiProperty({
    description: 'Auction ID associated with this order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  auctionId!: string;

  @ApiProperty({
    description: 'Buyer ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  buyerId!: string;

  @ApiProperty({
    description: 'Total order amount',
    example: 22500000,
  })
  totalAmount!: number;

  @ApiProperty({
    description: 'Current order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @ApiProperty({
    description: 'Products included in the auction associated with this order',
    type: [OrderProductResponseDto],
  })
  @Type(() => OrderProductResponseDto)
  products!: OrderProductResponseDto[];

  @ApiProperty({
    description: 'Payment records associated with this order',
    type: [OrderPaymentResponseDto],
  })
  @Type(() => OrderPaymentResponseDto)
  payments!: OrderPaymentResponseDto[];

  @ApiProperty({
    description: 'Order creation timestamp',
    example: '2026-09-27T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Order last update timestamp',
    example: '2026-09-27T08:30:00.000Z',
  })
  updatedAt!: Date;
}
