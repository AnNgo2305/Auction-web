export type AuctionWinnerEvent = {
  auctionId: string;
  winnerId: string;
  username: string;
  bidAmount: number;
  profileImageUrl: string | null;
};
