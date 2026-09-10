import type { ApiResponse } from '@/shared/types/response';
import type { AuctionStatus } from '@/shared/types/auction-status';
import type { PaginationData } from '@/shared/types/pagination.ts';

export class AuctionData {
  auctionId!: string;

  title!: string;

  startTime!: string;

  endTime!: string;

  startingPrice!: number;

  currentPrice!: number;

  bidCount!: number;

  status!: AuctionStatus;

  thumbnail!: string | null;

  createdAt!: string;
}

export type GetMyAuctionsResponse = ApiResponse<PaginationData<AuctionData>>;
