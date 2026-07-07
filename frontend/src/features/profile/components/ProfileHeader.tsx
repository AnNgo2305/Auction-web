import type { GetProfileData } from '@/features/profile/types/get-profile.response';
import type { Role } from '@generated/prisma/enums';
import type { RelationshipStatus } from '@modules/follow/follow.constant';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';

interface ProfileHeaderProps extends Pick<
  GetProfileData,
  | 'username'
  | 'fullName'
  | 'bio'
  | 'role'
  | 'followerCount'
  | 'followingCount'
  | 'mutualFollowedSellerCount'
  | 'relationship'
> {
  isOwner: boolean;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  SELLER: 'Seller',
  CUSTOMER: 'Customer',
};

const RELATIONSHIP_LABEL: Record<RelationshipStatus, string> = {
  NOT_FOLLOWING: 'Follow',
  FOLLOWING: 'Following',
  FRIEND: 'Message',
  REQUESTED: 'Requested',
  BLOCKED: 'Blocked',
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
  isOwner,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-1 items-start justify-between gap-6">
      {/* Left */}
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
          <div>
            <span className="font-semibold">{followerCount ?? 0}</span>{' '}
            Followers
          </div>

          <div>
            <span className="font-semibold">{followingCount ?? 0}</span>{' '}
            Following
          </div>

          {(mutualFollowedSellerCount ?? 0) > 0 && (
            <div>
              <span className="font-semibold">{mutualFollowedSellerCount}</span>{' '}
              Mutual sellers
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      {!isOwner && <Button>{RELATIONSHIP_LABEL[relationship.status]}</Button>}

      {isOwner && <Button variant="outline">Edit Profile</Button>}
    </div>
  );
}
