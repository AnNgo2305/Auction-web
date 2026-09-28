export interface BidErrorEvent {
  auctionId: string;
  tempId: string;
  bidAmount: number;
  message: string;
}