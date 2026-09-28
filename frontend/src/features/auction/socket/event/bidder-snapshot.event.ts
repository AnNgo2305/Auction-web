type AuctionBidder = {
  userId: string;
  profileImageUrl: string | null;
};

export type BidderSnapshotEvent = {
  auctionId: string;
  bidders: AuctionBidder[];
};
