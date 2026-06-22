import type { AuctionStatus } from '@generated/prisma/enums';

export class AuctionProductDetailDto {
  productId!: string;

  name!: string;

  description!: string;

  quantity!: number;

  categories!: string[];

  images!: string[];
}

export class GetAuctionDetailResponseDto {
  auctionId!: string;

  title!: string;

  startTime!: Date;

  endTime!: Date;

  startingPrice!: string;

  currentPrice!: string;

  minimumBidIncrement!: string;

  sellerName!: string;

  sellerId!: string;

  status!: AuctionStatus;

  lastBidTime?: Date;

  winnerId?: string;

  winnerName?: string;

  createdAt!: Date;

  bidCount!: number;

  products!: AuctionProductDetailDto[];
}
