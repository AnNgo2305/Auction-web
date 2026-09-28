import type { ApiResponse } from '@/shared/types/response';

export class MyBidData {
  bidId!: string;

  auctionId!: string;

  auctionTitle!: string;

  bidAmount!: number;

  createdAt!: string;
}

export class GetMyBidsData {
  bids!: MyBidData[];

  nextCursor!: string | null;
}

export type GetMyBidsResponse = ApiResponse<GetMyBidsData>;

