import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus } from '@generated/prisma/enums';

export class WatchlistItemResponseDto {
  @ApiProperty({
    description: 'Watchlist item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  watchlistId!: string;

  @ApiProperty({
    description: 'Auction ID',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  auctionId!: string;

  @ApiProperty({
    description: 'Auction title',
    example: 'Vintage Camera Auction',
  })
  title!: string;

  @ApiProperty({
    description: 'Current auction status',
    enum: AuctionStatus,
    example: 'OPEN',
  })
  status!: AuctionStatus;

  @ApiProperty({
    description: 'Auction end time',
    example: '2026-09-30T12:00:00.000Z',
  })
  endTime!: Date;

  @ApiProperty({
    description: 'Current auction price',
    example: 1500000,
  })
  currentPrice!: number;
}

export class WatchlistResponseDto {
  @ApiProperty({
    description: 'List of auctions in the current user watchlist',
    type: [WatchlistItemResponseDto],
  })
  watchlists!: WatchlistItemResponseDto[];

  @ApiProperty({
    description:
      'Cursor for retrieving the next page. Null when there are no more items.',
    nullable: true,
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  nextCursor!: string | null;
}
