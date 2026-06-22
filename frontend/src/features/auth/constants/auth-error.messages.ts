export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'Account does not exist',
  USER_IS_BLOCKED: 'Your account has been blocked',
  INVALID_PASSWORD: 'Incorrect password',
  ACCOUNT_LOCKED: 'Your account is temporarily locked. Please try again later',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many failed attempts. Please try again later',
  DEFAULT: 'Login failed. Please try again',
};

export const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: 'This email is already registered',
  USERNAME_ALREADY_EXISTS: 'This username is already taken',
  DEFAULT: 'Registration failed. Please try again',
};

export const VERIFY_EMAIL_OTP_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'User does not exist',
  EMAIL_ALREADY_VERIFIED: 'Your email is already verified',
  OTP_NOT_FOUND: 'Invalid OTP code. Please check and try again',
  OTP_EXPIRED: 'OTP code has expired. Please request a new one',
  DEFAULT: 'OTP verification failed. Please try again',
};

export const VERIFY_RESET_PASSWORD_OTP_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'User does not exist',
  OTP_NOT_FOUND: 'Invalid verification code. Please check and try again',
  OTP_EXPIRED: 'Verification code has expired. Please request a new one',
  DEFAULT: 'OTP verification failed. Please try again',
};

export const FORGOT_PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'No account found with this email address',
  DEFAULT: 'Failed to process request. Please try again',
};

export const RESET_PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  INVALID_RESET_TOKEN:
    'This reset session is invalid or has expired. Please try again',
  RESET_TOKEN_EXPIRED: 'This reset session has expired. Please try again',
  RESET_TOKEN_ALREADY_USED:
    'This reset session is no longer valid. Please try again',
  DEFAULT: 'Failed to reset password. Please try again',
};

export const RESEND_OTP_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'User does not exist',
  EMAIL_ALREADY_VERIFIED: 'Your email is already verified',
  DEFAULT: 'Failed to send OTP. Please try again',
};