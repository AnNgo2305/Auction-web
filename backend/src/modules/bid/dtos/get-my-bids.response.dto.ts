import { ApiProperty } from '@nestjs/swagger';

export class MyBidResponseDto {
  @ApiProperty({
    description: 'Bid ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  bidId!: string;

  @ApiProperty({
    description: 'Auction ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  auctionId!: string;

  @ApiProperty({
    description: 'Auction title',
    example: 'iPhone 17 Pro Max',
  })
  auctionTitle!: string;

  @ApiProperty({
    description: 'Bid amount',
    example: 23000000,
  })
  bidAmount!: number;

  @ApiProperty({
    description: 'Time when the bid was placed',
    example: '2026-09-23T10:30:00.000Z',
  })
  createdAt!: Date;
}
