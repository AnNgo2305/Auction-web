export const ERROR_INTERNAL_SERVER = {
  statusCode: 500,
  message: 'An unexpected error occurred',
  errorCode: 'INTERNAL_SERVER_ERROR',
};

export const ERROR_CLASS_VALIDATION_FAILED = {
  statusCode: 400,
  message: 'Class validation failed',
  errorCode: 'CLASS_VALIDATION_FAILED',
};

export const ERROR_ACCESS_TOKEN_EXPIRED = {
  statusCode: 401,
  errorCode: 'ACCESS_TOKEN_EXPIRED',
  message: 'Access token has expired',
};

export const ERROR_INVALID_ACCESS_TOKEN = {
  statusCode: 401,
  errorCode: 'INVALID_ACCESS_TOKEN',
  message: 'Access token is invalid',
};

export const ERROR_UNKNOWN_ACCESS_TOKEN = {
  statusCode: 401,
  errorCode: 'UNKNOWN_ACCESS_TOKEN',
  message: 'Unknown error occurred while verifying access token',
};

export const ERROR_REFRESH_TOKEN_EXPIRED = {
  statusCode: 401,
  errorCode: 'REFRESH_TOKEN_EXPIRED',
  message: 'Refresh token has expired',
};

export const ERROR_INVALID_REFRESH_TOKEN = {
  statusCode: 401,
  errorCode: 'INVALID_REFRESH_TOKEN',
  message: 'Refresh token is invalid',
};

export const ERROR_UNKNOWN_REFRESH_TOKEN = {
  statusCode: 401,
  errorCode: 'UNKNOWN_REFRESH_TOKEN',
  message: 'Unknown error occurred while verifying refresh token',
};

export const ERROR_MISSING_ACCESS_TOKEN = {
  statusCode: 401,
  errorCode: 'MISSING_ACCESS_TOKEN',
  message: 'Access token is missing',
};

export const ERROR_USER_BANNED = {
  statusCode: 403,
  errorCode: 'USER_IS_BANNED',
  message: 'User is banned',
};

export const ERROR_USER_FORBIDDEN = {
  statusCode: 403,
  errorCode: 'USER_NOT_PERMISSION',
  message: 'You do not have permission to access this resource',
};

export const ERROR_USER_UNVERIFIED = {
  statusCode: 401,
  code: 'USER_IS_UNVERIFIED',
  message: 'Your account has not been verified yet.',
};

export const ERROR_USER_NOT_EXIST = {
  statusCode: 404,
  code: 'USER_NOT_EXIST',
  message: 'User does not exist',
};
