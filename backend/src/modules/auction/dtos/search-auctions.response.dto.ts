import type { AuctionStatus } from '@generated/prisma/enums';

export class SearchAuctionsResponseDto {
  auctionId!: string;

  title!: string;

  startTime!: Date;

  endTime!: Date;

  startingPrice!: number;

  currentPrice!: number;

  bidCount!: number;

  status!: AuctionStatus;

  thumbnail!: string | null;

  createdAt!: Date;
}
