import { Type } from 'class-transformer';

export class AuctionProductResponseDto {
  productId!: string;
  name!: string;
  quantity!: number;
  thumbnailUrl!: string | null;
}

export class GetAuctionByIdResponseDto {
  auctionId!: string;
  sellerId!: string;
  title!: string;
  startTime!: Date;
  endTime!: Date;
  startingPrice!: number;
  minimumBidIncrement!: number;
  currentPrice!: number;
  bidCount!: number;
  status!: string;

  @Type(() => AuctionProductResponseDto)
  auctionProducts!: AuctionProductResponseDto[];

  createdAt!: Date;
  updatedAt!: Date;
}
