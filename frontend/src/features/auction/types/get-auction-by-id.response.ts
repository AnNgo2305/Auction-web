import type { ApiResponse } from '@/shared/types/response';
import type { AuctionStatus } from '@/shared/types/auction-status';

export class AuctionProductData {
  productId!: string;

  name!: string;

  quantity!: number;

  thumbnailUrl!: string | null;

  stockQuantity!: number;
}

export class AuctionWinnerData {
  userId!: string;

  username!: string;

  bidAmount!: number;

  profileImageUrl!: string | null;
}

export class GetAuctionByIdData {
  auctionId!: string;

  sellerId!: string;

  title!: string;

  startTime!: string;

  endTime!: string;

  startingPrice!: number;

  minimumBidIncrement!: number;

  currentPrice!: number;

  isInWatchlist!: boolean;

  latestBidderId!: string | null;

  bidCount!: number;

  status!: AuctionStatus;

  winner!: AuctionWinnerData | null;

  auctionProducts!: AuctionProductData[];

  createdAt!: string;

  updatedAt!: string;
}

export type GetAuctionByIdResponse = ApiResponse<GetAuctionByIdData>;
