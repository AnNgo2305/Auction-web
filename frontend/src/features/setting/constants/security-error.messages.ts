export const CHANGE_PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: 'Account does not exist',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  PASSWORD_CONFIRM_MISMATCH:
    'New password and confirmation password do not match',
  PASSWORD_UNCHANGED:
    'New password must be different from your current password',
  DEFAULT: 'Failed to change password. Please try again',
};

export const REVOKE_SESSION_ERROR_MESSAGES: Record<string, string> = {
  REFRESH_TOKEN_NOT_FOUND_OR_REVOKED:
    'Session not found or has already been revoked',
  DEFAULT: 'Failed to revoke session. Please try again',
};
