import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { Role } from '@/features/profile/types/profile.type';
import {
  type ProfileAction,
  RelationshipStatus,
} from '@/features/profile/types/relationship.type';
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
import { useUser } from '@/shared/contexts/UserContext.tsx';

interface ProfileHeaderProps {
  username: string;
  fullName: string | null;
  bio: string | null;
  role: Role;
  followerCount?: number;
  followingCount?: number;
  mutualFollowedSellerCount?: number;
  relationship: RelationshipStatus;
  isOwner: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  SELLER: 'Seller',
  BIDDER: 'Bidder',
};

export function ProfileHeader({
  username,
  fullName,
  bio,
  role,
  followerCount,
  followingCount,
  mutualFollowedSellerCount,
  relationship,
}: ProfileHeaderProps) {
  const { currentUser } = useUser();

  const relationshipLabel = getRelationshipLabel({
    relationship,
    currentUserRole: currentUser?.role,
    profileRole: role,
  });

  const relationshipActions = getRelationshipActions({
    relationship,
    currentUserRole: currentUser?.role,
    profileRole: role,
  });

  const handleRelationshipAction = (action: ProfileAction) => {
    switch (action) {
      case 'Follow':
        // TODO: followMutation.mutate();
        break;

      case 'Unfollow':
        // TODO: unfollowMutation.mutate();
        break;

      case 'Accept':
        // TODO: acceptFollowRequestMutation.mutate();
        break;

      case 'Decline':
        // TODO: declineFollowRequestMutation.mutate();
        break;

      case 'Cancel':
        // TODO: cancelFollowRequestMutation.mutate();
        break;

      case 'Block':
        // TODO: blockUserMutation.mutate();
        break;

      case 'Unblock':
        // TODO: unblockUserMutation.mutate();
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
            <div>
              <span className="font-semibold">
                {formatCount(followerCount)}
              </span>{' '}
              Followers
            </div>
          )}
          {followingCount !== undefined && (
            <div>
              <span className="font-semibold">
                {formatCount(followingCount)}
              </span>{' '}
              Following
            </div>
          )}
          {mutualFollowedSellerCount !== undefined &&
            mutualFollowedSellerCount > 0 && (
              <div>
                <span className="font-semibold">
                  {formatCount(mutualFollowedSellerCount)}
                </span>{' '}
                Mutual sellers
              </div>
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
