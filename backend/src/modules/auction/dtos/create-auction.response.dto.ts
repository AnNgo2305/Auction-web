import { AuctionStatus } from '@generated/prisma/enums';

class AuctionProductItemDto {
  productId!: string;

  quantity!: number;
}

export class CreateAuctionResponseDto {
  auctionId!: string;

  title!: string;

  startTime!: Date;

  endTime!: Date;

  startingPrice!: string;

  minimumBidIncrement!: string;

  status!: AuctionStatus;

  products!: AuctionProductItemDto[];
}
