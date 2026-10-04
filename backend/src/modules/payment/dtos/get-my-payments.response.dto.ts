import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@generated/prisma/enums';

export class MyPaymentsResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440005',
    description: 'Payment ID',
  })
  paymentId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440006',
    description: 'Order ID',
  })
  orderId: string;

  @ApiProperty({
    example: 22500000,
    description: 'Payment amount',
  })
  amount: number;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.SUCCESS,
    description: 'Payment status',
  })
  status: PaymentStatus;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440005',
    description: 'VNPay transaction reference',
  })
  transactionRef: string | null;

  @ApiPropertyOptional({
    example: '14979514',
    description: 'VNPay transaction number',
  })
  transactionNo: string | null;

  @ApiPropertyOptional({
    example: '00',
    description: 'VNPay response code',
  })
  responseCode: string | null;

  @ApiPropertyOptional({
    example: '2026-09-27T08:30:00.000Z',
    description: 'Payment completion time',
  })
  paidAt: Date | null;

  @ApiProperty({
    example: '2026-09-27T08:00:00.000Z',
    description: 'Payment creation time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-09-27T08:30:00.000Z',
    description: 'Last update time',
  })
  updatedAt: Date;
}
