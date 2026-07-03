export enum RelationshipStatus {
  SELF = 'SELF',
  NONE = 'NONE',
  FOLLOWING = 'FOLLOWING',
  ACCEPTED = 'ACCEPTED',
  PENDING_OUTGOING = 'PENDING_OUTGOING',
  PENDING_INCOMING = 'PENDING_INCOMING',
  BLOCKED = 'BLOCKED',
  BLOCKING = 'BLOCKING',
}

export const ERROR_CANNOT_FOLLOW_SELF = {
  statusCode: 409,
  errorCode: 'CANNOT_FOLLOW_SELF',
  message: 'You cannot follow your own account',
};

export const ERROR_ALREADY_FOLLOWED = {
  statusCode: 409,
  errorCode: 'ALREADY_FOLLOWED',
  message: 'You have already followed this user',
};

export const ERROR_ALREADY_REQUESTED = {
  statusCode: 409,
  errorCode: 'ALREADY_REQUESTED',
  message: 'You have already sent a follow request to this seller',
};

export const ERROR_FOLLOW_BLOCKED = {
  statusCode: 403,
  errorCode: 'FOLLOW_BLOCKED',
  message: 'You cannot follow them',
};

export const ERROR_CANNOT_UNFOLLOW_SELF = {
  statusCode: 409,
  errorCode: 'CANNOT_UNFOLLOW_SELF',
  message: 'User cannot unfollow themselves',
};

export const ERROR_NOT_FOLLOWING = {
  statusCode: 409,
  errorCode: 'NOT_FOLLOWING',
  message: 'You are not following this user',
};

export const ERROR_UNFOLLOW_BLOCKED = {
  statusCode: 403,
  errorCode: 'UNFOLLOW_BLOCKED',
  message: 'You cannot unfollow',
};

export const ERROR_SELLER_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'SELLER_NOT_FOUND',
  message: 'Seller not found or invalid',
};

export const ERROR_BIDDER_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'BIDDER_NOT_FOUND',
  message: 'Bidder not found or invalid',
};

export const ERROR_CANNOT_ACCEPT_SELF = {
  statusCode: 409,
  errorCode: 'CANNOT_ACCEPT_SELF',
  message: 'User cannot accept their own follow request',
};

export const ERROR_CANNOT_DECLINE_SELF = {
  statusCode: 409,
  message: 'You cannot decline yourself',
  errorCode: 'CANNOT_DECLINE_SELF',
};

export const ERROR_NO_FOLLOW_REQUEST = {
  statusCode: 404,
  errorCode: 'NO_FOLLOW_REQUEST',
  message: 'No follow request found',
};

export const ERROR_CANNOT_BLOCK_SELF = {
  statusCode: 409,
  message: 'You cannot block yourself',
  errorCode: 'CANNOT_BLOCK_SELF',
};

export const ERROR_ALREADY_BLOCKED = {
  statusCode: 409,
  message: 'You have already blocked this user',
  errorCode: 'ALREADY_BLOCKED',
};

export const ERROR_CANNOT_CANCEL_SELF = {
  statusCode: 409,
  errorCode: 'CANNOT_CANCEL_SELF_REQUEST',
  message: 'You cannot cancel a follow request to yourself',
};

export const ERROR_TARGET_USER_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'TARGET_USER_NOT_FOUND',
  message: 'Target user not found or invalid',
};

export const ERROR_CURRENT_USER_NOT_FOUND = {
  statusCode: 401,
  errorCode: 'CURRENT_USER_NOT_FOUND',
  message: 'Current user session is invalid or user does not exist',
};

export const ERROR_CANNOT_UNBLOCK_SELF = {
  statusCode: 409,
  errorCode: 'CANNOT_UNBLOCK_SELF',
  message: 'You cannot unblock yourself',
};

export const ERROR_NOT_BLOCKED = {
  statusCode: 404,
  errorCode: 'NOT_BLOCKED',
  message: 'You have not blocked this user',
};
