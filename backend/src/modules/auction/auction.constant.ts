export const ERROR_AUCTION_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'AUCTION_NOT_FOUND',
  message: 'Auction not found',
};

export const ERROR_AUCTION_ACCESS_DENIED = {
  statusCode: 403,
  errorCode: 'AUCTION_ACCESS_DENIED',
  message: 'You do not have permission to access this auction',
};

export const ERROR_AUCTION_TITLE_ALREADY_EXISTS = {
  statusCode: 409,
  errorCode: 'AUCTION_TITLE_ALREADY_EXISTS',
  message: 'You already have an auction with this title',
};

export const ERROR_AUCTION_START_TIME_INVALID = {
  statusCode: 400,
  errorCode: 'AUCTION_START_TIME_INVALID',
  message: 'Auction start time must be in the future',
};

export const ERROR_AUCTION_END_TIME_INVALID = {
  statusCode: 400,
  errorCode: 'AUCTION_END_TIME_INVALID',
  message: 'Auction end time must be after the start time',
};

export const ERROR_AUCTION_PRODUCTS_NOT_FOUND = {
  statusCode: 400,
  errorCode: 'AUCTION_PRODUCTS_NOT_FOUND',
  message: 'One or more products do not exist',
};

export const ERROR_AUCTION_PRODUCT_ACCESS_DENIED = {
  statusCode: 403,
  errorCode: 'AUCTION_PRODUCT_ACCESS_DENIED',
  message: 'One or more products do not belong to you',
};

export const ERROR_AUCTION_PRODUCTS_ALREADY_IN_AUCTION = {
  statusCode: 409,
  errorCode: 'AUCTION_PRODUCTS_ALREADY_IN_AUCTION',
  message: 'One or more products are already included in another auction',
};

export const ERROR_AUCTION_DUPLICATE_PRODUCTS = {
  statusCode: 400,
  errorCode: 'AUCTION_DUPLICATE_PRODUCTS',
  message: 'Duplicate products are not allowed in an auction',
};

export const ERROR_AUCTION_INVALID_STATUS = {
  statusCode: 400,
  errorCode: 'AUCTION_INVALID_STATUS',
  message: 'Auction status is invalid for this operation',
};

export const ERROR_AUCTION_STATUS_TRANSITION_NOT_ALLOWED = {
  statusCode: 400,
  errorCode: 'AUCTION_STATUS_TRANSITION_NOT_ALLOWED',
  message: 'Auction status transition is not allowed',
};

export const ERROR_AUCTION_CANNOT_UPDATE = {
  statusCode: 400,
  errorCode: 'CANNOT_UPDATE_AUCTION',
  message: 'Auction cannot be updated in its current status',
};

export const ERROR_AUCTION_ALREADY_STARTED = {
  statusCode: 400,
  errorCode: 'AUCTION_ALREADY_STARTED',
  message: 'Auction has already started',
};

export const ERROR_AUCTION_ALREADY_ENDED = {
  statusCode: 400,
  errorCode: 'AUCTION_ALREADY_ENDED',
  message: 'Auction has already ended',
};

export const ERROR_AUCTION_NOT_READY = {
  statusCode: 400,
  errorCode: 'AUCTION_NOT_READY',
  message: 'Auction is not ready to be opened',
};

export const ERROR_AUCTION_NOT_OPEN = {
  statusCode: 400,
  errorCode: 'AUCTION_NOT_OPEN',
  message: 'Auction is not currently open',
};

export const ERROR_AUCTION_HAS_BIDS = {
  statusCode: 400,
  errorCode: 'AUCTION_HAS_BIDS',
  message: 'Auction cannot be modified after receiving bids',
};

export const ERROR_AUCTION_PRODUCT_STATUS_INVALID = {
  statusCode: 400,
  errorCode: 'AUCTION_PRODUCT_STATUS_INVALID',
  message: 'One or more products are not ready for auction',
};

export const ERROR_AUCTION_PRODUCT_QUANTITY_INVALID = {
  statusCode: 400,
  errorCode: 'AUCTION_PRODUCT_QUANTITY_INVALID',
  message: 'Auction quantity cannot exceed available product quantity',
};

export const ERROR_AUCTION_CANNOT_CANCEL = {
  statusCode: 400,
  errorCode: 'CANNOT_CANCEL_AUCTION',
  message: 'Auction cannot be canceled in its current status',
};
