export const ERROR_BID_AMOUNT_INVALID = {
  statusCode: 400,
  errorCode: 'BID_AMOUNT_INVALID',
  message: 'The bid amount is invalid',
};

export const ERROR_AUCTION_NOT_OPEN = {
  statusCode: 400,
  errorCode: 'AUCTION_NOT_OPEN',
  message: 'This auction is not open for bidding',
};

export const ERROR_AUCTION_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'AUCTION_NOT_FOUND',
  message: 'Auction not found',
};

export const ERROR_AUCTION_ENDED = {
  statusCode: 400,
  errorCode: 'AUCTION_ENDED',
  message: 'This auction has ended',
};

export const ERROR_BID_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'BID_NOT_FOUND',
  message: 'Bid not found',
};
