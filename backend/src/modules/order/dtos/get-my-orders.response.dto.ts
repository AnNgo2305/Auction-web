import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@generated/prisma/enums';

export class MyOrderResponseDto {
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
    description: 'Auction title',
    example: 'MacBook Pro M4',
  })
  auctionTitle!: string;

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
