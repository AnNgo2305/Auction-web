import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { Role } from '@/features/profile/types/profile/profile.type';
import {
  type ProfileAction,
  RelationshipStatus,
} from '@/features/profile/types/profile/relationship.type';
import { formatCount } from '@/shared/utils/format-count';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  getRelationshipActions,
  getRelationshipLabel,
} from '@/features/profile/utils/relationship';
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

interface ProfileHeaderProps {
  userId: string,
  username: string;
  fullName: string | null;
  bio: string | null;
  role: Role;
  followerCount?: number;
  followingCount?: number;
  mutualFollowedSellerCount?: number;
  relationshipStatus: RelationshipStatus;
}

const ROLE_LABEL: Record<Role, string> = {
  SELLER: 'Seller',
  BIDDER: 'Bidder',
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
}: ProfileHeaderProps) {
  const { currentUser } = useUser();

  const relationshipLabel = getRelationshipLabel({
    relationship: relationshipStatus,
    currentUserRole: currentUser?.role,
    profileRole: role,
  });

  const relationshipActions = getRelationshipActions({
    relationship: relationshipStatus,
    currentUserRole: currentUser?.role,
    profileRole: role,
  });

  const followMutation = useFollowSeller(userId);
  const unfollowMutation = useUnfollowSeller(userId);
  const cancelFollowRequestMutation = useCancelFollowRequest(userId);

  const sellerId = currentUser?.userId ?? '';
  const acceptFollowMutation = useAcceptFollow(sellerId, userId);

  const declineFollowMutation = useDeclineFollow(userId);
  const blockBidderMutation = useBlockBidder(userId);
  const unblockBidderMutation = useUnblockBidder(userId);

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
    <div className="flex flex-1 items-start justify-between gap-6">
      <div className="min-w-0 space-y-3">
        <div>
          <h1 className="text-3xl font-bold">{fullName || username}</h1>
          <p className="text-muted-foreground text-sm">@{username}</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {ROLE_LABEL[role] ?? role}
        </Badge>
        {bio && <p className="max-w-2xl text-sm leading-relaxed">{bio}</p>}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {followerCount !== undefined && (
            <Link
              to={profilePaths.followers(userId)}
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
              to={profilePaths.following(userId)}
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
                to={profilePaths.following(userId)}
                className="hover:text-primary transition-colors"
              >
                <span className="font-semibold">
                  {formatCount(mutualFollowedSellerCount)}
                </span>{' '}
                Mutual sellers
              </Link>
            )}
        </div>
      </div>
      {/* Right */}
      <div className="flex items-center gap-2">
        {relationshipLabel && <Button>{relationshipLabel}</Button>}
        {relationshipActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {relationshipActions.map((action) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleRelationshipAction(action)}
                >
                  {action}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
