import type { ApiResponse } from '@/shared/types/response';

export class AuctionBidData {
  bidId!: string;

  username!: string;

  profileImageUrl!: string | null;

  bidAmount!: number;

  createdAt!: string;
}

export class GetAuctionBidsData {
  bids!: AuctionBidData[];

  nextCursor!: string | null;
}

export type GetAuctionBidsResponse = ApiResponse<GetAuctionBidsData>;
