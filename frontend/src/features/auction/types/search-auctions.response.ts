import type { ApiResponse } from '@/shared/types/response';
import type { PaginationData } from '@/shared/types/pagination.ts';
import type {
  PublicAuctionStatus,
} from '@/shared/types/auction-status';

export class SearchAuctionsData {
  auctionId!: string;

  title!: string;

  startTime!: string;

  endTime!: string;

  startingPrice!: number;

  currentPrice!: number;

  bidCount!: number;

  status!: PublicAuctionStatus;

  thumbnail!: string | null;

  createdAt!: string;
}

export type SearchAuctionsResponse = ApiResponse<
  PaginationData<SearchAuctionsData>
>;
