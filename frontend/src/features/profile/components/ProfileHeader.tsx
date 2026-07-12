import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Role } from '@/features/profile/types/profile/profile.type';
import { type ProfileAction, RelationshipStatus } from '@/features/profile/types/profile/relationship.type';
import { formatCount } from '@/shared/utils/format-count';
import { Ban, Check, type LucideIcon, ShieldCheck, UserMinus, UserPlus, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { getRelationshipActions, getRelationshipLabel } from '@/features/profile/utils/relationship';
import { useUser } from '@/shared/contexts/UserContext';
import { useFollowSeller } from '@/features/profile/hooks/relationship/useFollowSeller';
import { useUnfollowSeller } from '@/features/profile/hooks/relationship/useUnfollowSeller';
import { useCancelFollowRequest } from '@/features/profile/hooks/relationship/useCancelFollowRequest';
import { useAcceptFollow } from '@/features/profile/hooks/relationship/useAcceptFollow';
import { useDeclineFollow } from '@/features/profile/hooks/relationship/useDeclineFollow';
import { useBlockBidder } from '@/features/profile/hooks/relationship/useBlockBidder';
import { useUnblockBidder } from '@/features/profile/hooks/relationship/useUnblockBidder';
import { Link } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { cn } from '@/shared/lib/utils.ts';
import React from 'react';

interface ProfileHeaderProps {
  userId: string | undefined;
  username: string | undefined;
  fullName: string | null | undefined;
  bio: string | null | undefined;
  role: Role | undefined;
  followerCount?: number;
  followingCount?: number;
  mutualFollowedSellerCount?: number;
  relationshipStatus: RelationshipStatus | undefined;
  isInitialProfileLoading: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  SELLER: 'Seller',
  BIDDER: 'Bidder',
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  SELLER: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  BIDDER: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
};

type RelationshipActionItem = {
  action: ProfileAction;
  label: string;
  icon: LucideIcon;
  className?: string;
};

const ACTION_CONFIG: Record<ProfileAction, RelationshipActionItem> = {
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
    label: 'Accept request',
    icon: Check,
    className: 'text-green-600',
  },
  Decline: {
    action: 'Decline',
    label: 'Decline request',
    icon: X,
    className: 'text-red-600',
  },
  Cancel: {
    action: 'Cancel',
    label: 'Cancel request',
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
    label: 'Unblock user',
    icon: ShieldCheck,
    className: 'text-green-600',
  },
};

export function ProfileHeader({
  userId,
  username,
  fullName,
  bio,
  role,
  followerCount,
  followingCount,
  mutualFollowedSellerCount,
  relationshipStatus,
  isInitialProfileLoading = false,
}: ProfileHeaderProps) {
  if (isInitialProfileLoading) {
    return (
      <div className="-mt-5 flex flex-1 items-start justify-between gap-6">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-1">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-36" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full max-w-3xl" />
              <Skeleton className="h-4 w-3/4 max-w-2xl" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-6 text-sm">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
        <div className="-mt-2 flex shrink-0 items-center pl-5">
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    );
  }

  const { currentUser } = useUser();

  const relationshipLabel = getRelationshipLabel({
    relationship: relationshipStatus!,
    currentUserRole: currentUser?.role,
    profileRole: role!,
  });

  const relationshipActions = getRelationshipActions({
    relationship: relationshipStatus!,
    currentUserRole: currentUser?.role,
    profileRole: role!,
  });

  const followMutation = useFollowSeller(userId!);
  const unfollowMutation = useUnfollowSeller(userId!);
  const cancelFollowRequestMutation = useCancelFollowRequest(userId!);

  const sellerId = currentUser?.userId ?? '';
  const acceptFollowMutation = useAcceptFollow(sellerId, userId!);

  const declineFollowMutation = useDeclineFollow(userId!);
  const blockBidderMutation = useBlockBidder(userId!);
  const unblockBidderMutation = useUnblockBidder(userId!);

  const handleRelationshipAction = (action: ProfileAction) => {
    switch (action) {
      case 'Follow':
        followMutation.mutate();
        break;

      case 'Unfollow':
        unfollowMutation.mutate();
        break;

      case 'Accept':
        acceptFollowMutation.mutate();
        break;

      case 'Decline':
        declineFollowMutation.mutate();
        break;

      case 'Cancel':
        cancelFollowRequestMutation.mutate();
        break;

      case 'Block':
        blockBidderMutation.mutate();
        break;

      case 'Unblock':
        unblockBidderMutation.mutate();
        break;

      default:
        break;
    }
  };

  return (
    <div className="-mt-5 flex flex-1 items-start justify-between gap-6">
      <div className="flex min-w-0 flex-1 items-start justify-between gap-1">
        {/* Profile info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl leading-none font-bold">{username}</h1>
            <Badge
              variant="secondary"
              className={cn(ROLE_BADGE_CLASS[role!] ?? '', 'relative top-0.5')}
            >
              {ROLE_LABEL[role!] ?? role}
            </Badge>
          </div>
          <p className="text-sm font-normal">{fullName || username}</p>
          <p className="line-clamp-2 min-h-12 max-w-3xl text-sm leading-6 wrap-break-word italic">
            {bio || ''}
          </p>
        </div>
        {/* Stats */}
        <div className="flex shrink-0 items-center gap-6 text-sm">
          {followerCount !== undefined && (
            <Link
              to={profilePaths.followers(userId!)}
              className="hover:text-primary transition-colors"
            >
              <span className="font-semibold">
                {formatCount(followerCount)}
              </span>{' '}
              Followers
            </Link>
          )}
          {followingCount !== undefined && (
            <Link
              to={profilePaths.following(userId!)}
              className="hover:text-primary transition-colors"
            >
              <span className="font-semibold">
                {formatCount(followingCount)}
              </span>{' '}
              Following
            </Link>
          )}
          {mutualFollowedSellerCount !== undefined &&
            mutualFollowedSellerCount > 0 && (
              <Link
                to={profilePaths.following(userId!)}
                className="hover:text-primary transition-colors"
              >
                <span className="font-semibold">
                  {formatCount(mutualFollowedSellerCount)}
                </span>{' '}
                Mutual Following
              </Link>
            )}
        </div>
      </div>

      {/* Right */}
      <div className="-mt-2 flex shrink-0 items-center pl-5">
        {relationshipLabel && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>{relationshipLabel}</Button>
            </DropdownMenuTrigger>

            {relationshipActions.length > 0 && (
              <DropdownMenuContent align="end">
                {relationshipActions.map((action, index) => {
                  const config = ACTION_CONFIG[action];
                  const Icon = config.icon;
                  return (
                    <React.Fragment key={action}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => handleRelationshipAction(action)}
                        className={config.className}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {action}
                      </DropdownMenuItem>
                    </React.Fragment>
                  );
                })}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
