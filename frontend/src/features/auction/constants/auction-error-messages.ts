export const CREATE_AUCTION_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_START_TIME_INVALID: 'Auction start time must be in the future',
  AUCTION_END_TIME_INVALID: 'Auction end time must be after the start time',
  AUCTION_DUPLICATE_PRODUCTS:
    'Duplicate products are not allowed in an auction',
  AUCTION_PRODUCTS_NOT_FOUND: 'One or more products do not exist',
  AUCTION_PRODUCT_ACCESS_DENIED: 'One or more products do not belong to you',
  AUCTION_PRODUCTS_ALREADY_IN_AUCTION:
    'One or more products are already included in another auction',
  AUCTION_PRODUCT_STATUS_INVALID:
    'One or more products are not ready for auction',
  AUCTION_PRODUCT_QUANTITY_INVALID:
    'Auction quantity cannot exceed available product quantity',
  DEFAULT: 'Failed to create auction',
} as const;

export const CANCEL_AUCTION_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_NOT_FOUND: 'Auction not found',
  AUCTION_ACCESS_DENIED: 'You do not have permission to access this auction',
  CANNOT_CANCEL_AUCTION: 'Auction cannot be canceled in its current status',
  DEFAULT: 'Failed to cancel auction',
} as const;

export const CONFIRM_AUCTION_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_NOT_FOUND: 'Auction not found',
  AUCTION_INVALID_STATUS: 'Auction status is invalid for this operation',
  DEFAULT: 'Failed to confirm auction',
} as const;

export const END_AUCTION_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_NOT_FOUND: 'Auction not found',
  AUCTION_ACCESS_DENIED: 'You do not have permission to access this auction',
  AUCTION_NOT_OPEN: 'Auction is not currently open',
  DEFAULT: 'Failed to end auction',
} as const;

export const UPDATE_AUCTION_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_ACCESS_DENIED: 'You do not have permission to access this auction',
  CANNOT_UPDATE_AUCTION: 'Auction cannot be updated in its current status',
  AUCTION_NOT_FOUND: 'Auction not found',
  AUCTION_START_TIME_INVALID: 'Auction start time must be in the future',
  AUCTION_END_TIME_INVALID: 'Auction end time must be after the start time',
  AUCTION_DUPLICATE_PRODUCTS:
    'Duplicate products are not allowed in an auction',
  AUCTION_PRODUCTS_NOT_FOUND: 'One or more products do not exist',
  AUCTION_PRODUCT_ACCESS_DENIED: 'One or more products do not belong to you',
  AUCTION_PRODUCTS_ALREADY_IN_AUCTION:
    'One or more products are already included in another auction',
  AUCTION_PRODUCT_STATUS_INVALID:
    'One or more products are not ready for auction',
  AUCTION_PRODUCT_QUANTITY_INVALID:
    'Auction quantity cannot exceed available product quantity',

  DEFAULT: 'Failed to update auction',
} as const;

export const RESUBMIT_AUCTION_ERROR_MESSAGES: Record<string, string> = {
  AUCTION_NOT_FOUND: 'Auction not found',
  AUCTION_ACCESS_DENIED: 'You do not have permission to access this auction',
  AUCTION_INVALID_STATUS: 'Auction status is invalid for this operation',
  AUCTION_START_TIME_INVALID: 'Auction start time must be in the future',
  AUCTION_END_TIME_INVALID: 'Auction end time must be after the start time',
  AUCTION_PRODUCTS_NOT_FOUND: 'One or more products do not exist',
  AUCTION_PRODUCT_STATUS_INVALID:
    'One or more products are not ready for auction',
  AUCTION_PRODUCT_QUANTITY_INVALID:
    'Auction quantity cannot exceed available product quantity',
  AUCTION_PRODUCTS_ALREADY_IN_AUCTION:
    'One or more products are already included in another auction',
  DEFAULT: 'Failed to resubmit auction',
} as const;
