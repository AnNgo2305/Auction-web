import type { ProfileAction } from '@/features/profile/types/profile/relationship.type.ts';
import { Ban, Check, type LucideIcon, ShieldCheck, UserMinus, UserPlus, X } from 'lucide-react';

type RelationshipActionItem = {
  action: ProfileAction;
  label: string;
  icon: LucideIcon;
  className?: string;
};

export const ACTION_CONFIG: Record<ProfileAction, RelationshipActionItem> = {
  Follow: {
    action: 'Follow',
    label: 'Follow',
    icon: UserPlus,
  },
  Unfollow: {
    action: 'Unfollow',
    label: 'Unfollow',
    icon: UserMinus,
  },
  Accept: {
    action: 'Accept',
    label: 'Accept',
    icon: Check,
    className: 'text-green-600',
  },
  Decline: {
    action: 'Decline',
    label: 'Decline',
    icon: X,
    className: 'text-red-600',
  },
  Cancel: {
    action: 'Cancel',
    label: 'Cancel',
    icon: X,
  },
  Block: {
    action: 'Block',
    label: 'Block',
    icon: Ban,
    className: 'text-red-600',
  },
  Unblock: {
    action: 'Unblock',
    label: 'Unblock',
    icon: ShieldCheck,
    className: 'text-green-600',
  },
};