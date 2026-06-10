export const ERROR_USER_BLOCKED = {
  statusCode: 403,
  message: 'User is blocked',
  errorCode: 'USER_IS_BLOCKED',
};

export const ERROR_INVALID_PASSWORD = (attemptsLeft: number) => ({
  statusCode: 401,
  message: `Invalid password. ${attemptsLeft} attempts left.`,
  errorCode: 'INVALID_PASSWORD',
});

export const ERROR_EMAIL_ALREADY_EXISTS = {
  statusCode: 409,
  message: 'Email already exists',
  errorCode: 'EMAIL_ALREADY_EXISTS',
};

export const ERROR_USERNAME_ALREADY_EXISTS = {
  statusCode: 409,
  message: 'Username already exists',
  errorCode: 'USERNAME_ALREADY_EXISTS',
};

export const ERROR_EMAIL_ALREADY_VERIFIED = {
  statusCode: 400,
  message: 'Email already verified',
  errorCode: 'EMAIL_ALREADY_VERIFIED',
};

export const ERROR_REFRESH_TOKEN_NOT_FOUND = {
  statusCode: 401,
  errorCode: 'REFRESH_TOKEN_NOT_FOUND',
  message: 'Refresh token not found',
};

export const ERROR_USER_NOT_FOUND = {
  statusCode: 404,
  message: 'User not found',
  errorCode: 'USER_NOT_FOUND',
};

export const ERROR_PASSWORD_CONFIRM_MISMATCH = {
  statusCode: 400,
  errorCode: 'PASSWORD_CONFIRM_MISMATCH',
  message: 'New password and confirm password do not match',
};

export const ERROR_INVALID_LOGOUT_TOKEN = {
  statusCode: 401,
  errorCode: 'INVALID_LOGOUT_TOKEN',
  message: 'Invalid token for logout or token does not belong to the user',
};

export const ERROR_ACCOUNT_LOCKED = (minutesLeft: number) => ({
  statusCode: 403,
  errorCode: 'ACCOUNT_LOCKED',
  message: `Account locked. Try again in ${minutesLeft} minutes`,
});

export const ERROR_TOO_MANY_LOGIN_ATTEMPTS = (lockDurationMinutes: number) => ({
  statusCode: 403,
  message: `Too many failed attempts. Account locked for ${lockDurationMinutes} minutes.`,
  errorCode: 'TOO_MANY_LOGIN_ATTEMPTS',
});

export const ERROR_INVALID_RESET_TOKEN = {
  statusCode: 400,
  errorCode: 'INVALID_RESET_TOKEN',
  message: 'Reset token is invalid',
};

export const ERROR_RESET_TOKEN_EXPIRED = {
  statusCode: 400,
  errorCode: 'RESET_TOKEN_EXPIRED',
  message: 'Reset token has expired',
};

export const ERROR_RESET_TOKEN_ALREADY_USED = {
  statusCode: 400,
  errorCode: 'RESET_TOKEN_ALREADY_USED',
  message: 'Reset token has already been used',
};

export const ERROR_MISSING_REFRESH_TOKEN = {
  statusCode: 401,
  errorCode: 'MISSING_REFRESH_TOKEN',
  message: 'Refresh token is missing',
};

export const ERROR_EMAIL_NOT_VERIFIED = {
  statusCode: 403,
  errorCode: 'EMAIL_NOT_VERIFIED',
  message: 'Email has not been verified',
};
