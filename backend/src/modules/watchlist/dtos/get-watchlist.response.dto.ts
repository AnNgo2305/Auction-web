import type { AuctionStatus } from '@generated/prisma/enums';

export class WatchlistItemResponseDto {
  watchlistId!: string;
  auctionId!: string;
  title!: string;
  status!: AuctionStatus;
  endTime!: Date;
  currentPrice!: number;
}

export class WatchlistResponseDto {
  watchlists!: WatchlistItemResponseDto[];
  nextCursor!: string | null;
}
