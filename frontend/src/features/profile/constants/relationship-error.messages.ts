export const FOLLOW_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_FOLLOW_SELF: 'You cannot follow your own account.',
  BIDDER_NOT_FOUND: 'We couldn’t find your account. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find this seller.',
  FOLLOW_BLOCKED: 'You cannot follow this user.',
  ALREADY_REQUESTED: 'You have already sent a follow request to this seller.',
  ALREADY_FOLLOWED: 'You are already following this user.',
  DEFAULT:
    'Something went wrong while sending your follow request. Please try again.',
} as const;

export const UNFOLLOW_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_UNFOLLOW_SELF: 'You cannot unfollow your own account.',
  BIDDER_NOT_FOUND: 'We couldn’t find your account. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find this seller. Please try again later.',
  NOT_FOLLOWING: 'You are not following this user.',
  UNFOLLOW_BLOCKED: 'You cannot unfollow this user.',
  DEFAULT: 'Something went wrong while unfollowing. Please try again.',
} as const;

export const CANCEL_FOLLOW_REQUEST_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_CANCEL_SELF_REQUEST: 'You cannot cancel a follow request to yourself.',
  BIDDER_NOT_FOUND: 'We couldn’t find your account. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find this seller. Please try again later.',
  NO_FOLLOW_REQUEST: 'No pending follow request was found.',
  DEFAULT:
    'Something went wrong while cancelling your follow request. Please try again.',
} as const;

export const ACCEPT_FOLLOW_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_ACCEPT_SELF: 'You cannot accept your own follow request.',
  BIDDER_NOT_FOUND: 'We couldn’t find this bidder. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  NO_FOLLOW_REQUEST:
    'This follow request no longer exists or has already been processed.',
  DEFAULT:
    'Something went wrong while accepting the follow request. Please try again.',
} as const;

export const DECLINE_FOLLOW_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_DECLINE_SELF: 'You cannot decline your own follow request.',
  BIDDER_NOT_FOUND: 'We couldn’t find this bidder. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  NO_FOLLOW_REQUEST:
    'This follow request no longer exists or has already been processed.',
  DEFAULT:
    'Something went wrong while declining the follow request. Please try again.',
} as const;

export const BLOCK_BIDDER_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_BLOCK_SELF: 'You cannot block yourself.',
  BIDDER_NOT_FOUND: 'We couldn’t find this bidder. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  ALREADY_BLOCKED: 'You have already blocked this user.',
  DEFAULT: 'Something went wrong while blocking this user. Please try again.',
} as const;

export const UNBLOCK_BIDDER_ERROR_MESSAGES: Record<string, string> = {
  CANNOT_UNBLOCK_SELF: 'You cannot unblock yourself.',
  BIDDER_NOT_FOUND: 'We couldn’t find this bidder. Please try again later.',
  SELLER_NOT_FOUND: 'We couldn’t find your profile. Please try again later.',
  NOT_BLOCKED: 'This user is not currently blocked.',
  DEFAULT: 'Something went wrong while unblocking this user. Please try again.',
} as const;
