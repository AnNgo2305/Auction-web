export enum RelationshipStatus {
  SELF = 'SELF',
  NONE = 'NONE',
  FOLLOWING = 'FOLLOWING',
  ACCEPTED = 'ACCEPTED',
  PENDING_OUTGOING = 'PENDING_OUTGOING',
  PENDING_INCOMING = 'PENDING_INCOMING',
  BLOCKING = 'BLOCKING',
}

export type ProfileAction =
  | 'Follow'
  | 'Unfollow'
  | 'Cancel'
  | 'Accept'
  | 'Decline'
  | 'Block'
  | 'Unblock';

