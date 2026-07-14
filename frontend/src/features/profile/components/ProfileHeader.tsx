import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCount } from '@/shared/utils/format-count';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { getRelationshipActions, getRelationshipLabel } from '@/features/profile/utils/relationship';
import { useUser } from '@/shared/contexts/UserContext';
import { Link } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { cn } from '@/shared/lib/utils.ts';
import React from 'react';
import { useRelationshipActions } from '@/features/profile/hooks/relationship/useRelationshipActions';
import { type Role, ROLES } from '@/shared/types/user.ts';
import {
  ACTION_CONFIG,
  type RelationshipStatus,
} from '@/shared/types/relationship.ts';

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
  [ROLES.SELLER]: 'Seller',
  [ROLES.BIDDER]: 'Bidder',
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  [ROLES.SELLER]: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  [ROLES.BIDDER]: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
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
  const { currentUser } = useUser();
  const { handleRelationshipAction } = useRelationshipActions();

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

  return (
    <div className="-mt-5 flex flex-1 items-start justify-between gap-6">
      <div className="min-w-0 flex-1">
        {/* Top */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-6">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="text-3xl leading-none font-bold">{username}</h1>
              <Badge
                variant="secondary"
                className={cn(
                  ROLE_BADGE_CLASS[role!] ?? '',
                  'relative top-0.5',
                )}
              >
                {ROLE_LABEL[role!] ?? role}
              </Badge>
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
              {mutualFollowedSellerCount !== undefined && (
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
                            onClick={() =>
                              handleRelationshipAction(
                                currentUser?.userId!,
                                userId!,
                                action,
                              )
                            }
                            className={config.className}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {config.label}
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
        {/* Profile info */}
        <div className="mt-2 min-w-0 space-y-1">
          <p className="text-sm font-normal">{fullName || username}</p>
          <p className="line-clamp-2 max-w-2xl text-sm leading-6 wrap-break-word italic">
            {bio || ''}
          </p>
        </div>
      </div>
    </div>
  );
}
