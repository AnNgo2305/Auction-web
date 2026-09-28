type AuctionBidder = {
  userId: string;
  profileImageUrl: string | null;
};

export type BidderJoinedEvent = {
  auctionId: string;
  bidder: AuctionBidder;
};
