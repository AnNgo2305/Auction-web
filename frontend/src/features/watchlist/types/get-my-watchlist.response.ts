import type { ApiResponse } from '@/shared/types/response';
import type { AuctionStatus } from '@/shared/types/auction-status';

export class WatchlistItemResponse {
  watchlistId!: string;
  auctionId!: string;
  title!: string;
  status!: AuctionStatus;
  endTime!: string;
  currentPrice!: number;
}

export class WatchlistResponse {
  watchlists!: WatchlistItemResponse[];
  nextCursor!: string | null;
}

export type GetMyWatchlistResponse = ApiResponse<WatchlistResponse>;
