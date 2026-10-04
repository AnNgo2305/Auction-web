export const ERROR_ORDER_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'ORDER_NOT_FOUND',
  message: 'Order not found',
};

export const ERROR_ORDER_ALREADY_EXISTS = {
  statusCode: 409,
  errorCode: 'ORDER_ALREADY_EXISTS',
  message: 'Order already exists for this auction',
};

export const ERROR_ORDER_AUCTION_NOT_COMPLETED = {
  statusCode: 400,
  errorCode: 'ORDER_AUCTION_NOT_COMPLETED',
  message: 'Order can only be created for a completed auction',
};

export const ERROR_ORDER_AUCTION_NO_WINNER = {
  statusCode: 400,
  errorCode: 'ORDER_AUCTION_NO_WINNER',
  message: 'Cannot create order because the auction has no winner',
};

export const ERROR_ORDER_INVALID_STATUS = {
  statusCode: 400,
  errorCode: 'ORDER_INVALID_STATUS',
  message: 'Order status is invalid for this operation',
};
