export const ERROR_PAYMENT_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'PAYMENT_NOT_FOUND',
  message: 'Payment not found',
};

export const ERROR_PAYMENT_INVALID_STATUS = {
  statusCode: 400,
  errorCode: 'PAYMENT_INVALID_STATUS',
  message: 'Payment is not available for this operation',
};

export const ERROR_PAYMENT_INVALID_SIGNATURE = {
  statusCode: 400,
  errorCode: 'PAYMENT_INVALID_SIGNATURE',
  message: 'Invalid payment signature',
};

export const ERROR_PAYMENT_AMOUNT_MISMATCH = {
  statusCode: 400,
  errorCode: 'PAYMENT_AMOUNT_MISMATCH',
  message: 'Payment amount does not match the transaction amount',
};

export const ERROR_PAYMENT_FAILED = {
  statusCode: 400,
  errorCode: 'PAYMENT_FAILED',
  message: 'Payment failed',
};

export const ERROR_PAYMENT_ALREADY_COMPLETED = {
  statusCode: 400,
  errorCode: 'PAYMENT_ALREADY_COMPLETED',
  message: 'Payment has already been completed',
};

export const ERROR_PAYMENT_CREATION_IN_PROGRESS = {
  statusCode: 409,
  errorCode: 'PAYMENT_CREATION_IN_PROGRESS',
  message: 'Payment creation is already in progress',
};
