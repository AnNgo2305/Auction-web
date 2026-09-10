export const AuctionSortBy = {
  CREATED_AT: 'createdAt',
  END_TIME: 'endTime',
  CURRENT_PRICE: 'currentPrice',
  BID_COUNT: 'bidCount',
} as const;

export type AuctionSortBy = (typeof AuctionSortBy)[keyof typeof AuctionSortBy];

export const AuctionSortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type AuctionSortOrder =
  (typeof AuctionSortOrder)[keyof typeof AuctionSortOrder];
