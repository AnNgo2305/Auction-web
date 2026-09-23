import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus } from '@generated/prisma/enums';

export class SearchAuctionsResponseDto {
  @ApiProperty({
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  auctionId!: string;

  @ApiProperty({
    description: 'Auction title',
    example: 'MacBook Pro M4',
  })
  title!: string;

  @ApiProperty({
    description: 'Auction start time',
    example: '2026-09-25T08:00:00.000Z',
  })
  startTime!: Date;

  @ApiProperty({
    description: 'Auction end time',
    example: '2026-09-27T08:00:00.000Z',
  })
  endTime!: Date;

  @ApiProperty({
    description: 'Starting price of the auction',
    example: 20000000,
  })
  startingPrice!: number;

  @ApiProperty({
    description: 'Current price of the auction',
    example: 22500000,
  })
  currentPrice!: number;

  @ApiProperty({
    description: 'Number of bids placed on the auction',
    example: 5,
  })
  bidCount!: number;

  @ApiProperty({
    description: 'Current auction status',
    enum: AuctionStatus,
    example: AuctionStatus.OPEN,
  })
  status!: AuctionStatus;

  @ApiProperty({
    description: 'Public URL of the auction thumbnail',
    nullable: true,
    example: 'https://example.com/images/macbook.jpg',
  })
  thumbnail!: string | null;

  @ApiProperty({
    description: 'Auction creation timestamp',
    example: '2026-09-23T08:00:00.000Z',
  })
  createdAt!: Date;
}
