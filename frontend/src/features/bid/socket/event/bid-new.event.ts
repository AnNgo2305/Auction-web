export interface BidNewEvent {
  bidId: string;
  auctionId: string;
  userId: string;
  username: string;
  profileImageUrl: string | null;
  bidAmount: number;
  createdAt: string;
}