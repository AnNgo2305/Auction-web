export class HighestBidResponseDto {
  bidId!: string;

  auctionId!: string;

  bidAmount!: number;

  username!: string;

  userId!: string;

  profileImageUrl!: string | null;

  createdAt!: Date;
}
