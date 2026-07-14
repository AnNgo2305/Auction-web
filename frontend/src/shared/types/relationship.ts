import {
  Ban,
  Check,
  type LucideIcon,
  ShieldCheck,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';

export const RELATIONSHIP_STATUSES = {
  SELF: 'SELF',
  NONE: 'NONE',
  FOLLOWING: 'FOLLOWING',
  ACCEPTED: 'ACCEPTED',
  PENDING_OUTGOING: 'PENDING_OUTGOING',
  PENDING_INCOMING: 'PENDING_INCOMING',
  BLOCKING: 'BLOCKING',
} as const;

export type RelationshipStatus =
  (typeof RELATIONSHIP_STATUSES)[keyof typeof RELATIONSHIP_STATUSES];

export const PROFILE_ACTIONS = {
  FOLLOW: 'FOLLOW',
  UNFOLLOW: 'UNFOLLOW',
  CANCEL: 'CANCEL',
  ACCEPT: 'ACCEPT',
  DECLINE: 'DECLINE',
  BLOCK: 'BLOCK',
  UNBLOCK: 'UNBLOCK',
} as const;

export type ProfileAction =
  (typeof PROFILE_ACTIONS)[keyof typeof PROFILE_ACTIONS];

type RelationshipActionItem = {
  action: ProfileAction;
  label: string;
  icon: LucideIcon;
  className?: string;
};

export const ACTION_CONFIG: Record<ProfileAction, RelationshipActionItem> = {
  [PROFILE_ACTIONS.FOLLOW]: {
    action: PROFILE_ACTIONS.FOLLOW,
    label: 'Follow',
    icon: UserPlus,
  },
  [PROFILE_ACTIONS.UNFOLLOW]: {
    action: PROFILE_ACTIONS.UNFOLLOW,
    label: 'Unfollow',
    icon: UserMinus,
  },
  [PROFILE_ACTIONS.ACCEPT]: {
    action: PROFILE_ACTIONS.ACCEPT,
    label: 'Accept',
    icon: Check,
    className: 'text-green-600',
  },
  [PROFILE_ACTIONS.DECLINE]: {
    action: PROFILE_ACTIONS.DECLINE,
    label: 'Decline',
    icon: X,
    className: 'text-red-600',
  },
  [PROFILE_ACTIONS.CANCEL]: {
    action: PROFILE_ACTIONS.CANCEL,
    label: 'Cancel',
    icon: X,
  },
  [PROFILE_ACTIONS.BLOCK]: {
    action: PROFILE_ACTIONS.BLOCK,
    label: 'Block',
    icon: Ban,
    className: 'text-red-600',
  },
  [PROFILE_ACTIONS.UNBLOCK]: {
    action: PROFILE_ACTIONS.UNBLOCK,
    label: 'Unblock',
    icon: ShieldCheck,
    className: 'text-green-600',
  },
};
