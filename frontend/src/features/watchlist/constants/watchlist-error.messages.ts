export const ADD_TO_WATCHLIST_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_ALREADY_IN_WATCHLIST: 'Auction is already in your watchlist',
  AUCTION_NOT_FOUND: 'Auction not found',
  DEFAULT: 'Failed to add auction to watchlist',
} as const;

export const REMOVE_FROM_WATCHLIST_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_NOT_IN_WATCHLIST: 'Auction is not in your watchlist',
  DEFAULT: 'Failed to remove auction from watchlist',
} as const;
