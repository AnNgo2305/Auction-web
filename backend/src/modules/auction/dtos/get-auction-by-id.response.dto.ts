import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AuctionStatus } from '@generated/prisma/enums';

export class AuctionProductResponseDto {
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
    description: 'Quantity of the product included in the auction',
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    description: 'Public URL of the product thumbnail',
    nullable: true,
    example: 'https://example.com/images/macbook.jpg',
  })
  thumbnailUrl!: string | null;

  @ApiProperty({
    description: 'Current available stock quantity',
    example: 8,
  })
  stockQuantity!: number;
}

export class GetAuctionByIdResponseDto {
  @ApiProperty({
    description: 'Auction ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  auctionId!: string;

  @ApiProperty({
    description: 'ID of the seller who created the auction',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  sellerId!: string;

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
    description: 'Minimum amount required for each subsequent bid',
    example: 500000,
  })
  minimumBidIncrement!: number;

  @ApiProperty({
    description: 'Current highest bid price',
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
    description:
      'Whether the current user has added the auction to their watchlist',
    example: false,
  })
  isInWatchlist!: boolean;

  @ApiProperty({
    description: 'Products included in the auction',
    type: [AuctionProductResponseDto],
  })
  @Type(() => AuctionProductResponseDto)
  auctionProducts!: AuctionProductResponseDto[];

  @ApiProperty({
    description: 'Auction creation timestamp',
    example: '2026-09-23T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Auction last update timestamp',
    example: '2026-09-23T09:00:00.000Z',
  })
  updatedAt!: Date;
}
