export const AUCTION_ROUTES = {
  LIST: '',
  DETAIL: ':auctionId',
} as const;

export const auctionPaths = {
  list: () => '/auctions',
  detail: (auctionId: string) => `/auctions/${auctionId}`,
} as const;
