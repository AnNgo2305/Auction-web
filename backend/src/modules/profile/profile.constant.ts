export const ERROR_PROFILE_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'PROFILE_NOT_FOUND',
  message: 'Profile not found',
};

export const ERROR_USER_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'USER_NOT_FOUND',
  message: 'User not found',
};

export const ERROR_PASSWORD_CONFIRM_MISMATCH = {
  statusCode: 400,
  errorCode: 'PASSWORD_CONFIRM_MISMATCH',
  message: 'New password and confirm password do not match',
};

export const ERROR_INVALID_CURRENT_PASSWORD = {
  statusCode: 401,
  errorCode: 'INVALID_CURRENT_PASSWORD',
  message: 'Current password is incorrect',
};

export const ERROR_PASSWORD_UNCHANGED = {
  statusCode: 409,
  errorCode: 'PASSWORD_UNCHANGED',
  message: 'New password must be different from current password',
};

export const ERROR_PROFILE_ALREADY_EXISTS = {
  statusCode: 409,
  errorCode: 'PROFILE_ALREADY_EXISTS',
  message: 'Profile already exists',
};
