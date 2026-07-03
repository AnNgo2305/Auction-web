import type { Role } from '@generated/prisma/enums';
import type { RelationshipStatus } from '@modules/follow/follow.constant';

export class GetProfileResponseDto {
  userId!: string;

  email!: string;

  username!: string;

  role!: Role;

  createdAt!: Date;

  updatedAt!: Date;

  fullName?: string | null;

  phoneNumber?: string | null;

  bio?: string | null;

  profileImageUrl?: string | null;

  dateOfBirth?: Date | null;

  gender?: string | null;

  coverImageUrl?: string | null;

  followerCount?: number;

  followingCount?: number;

  mutualFollowedSellerCount?: number;

  relationship!: {
    status: RelationshipStatus;

    friendshipId?: string;
  };
}
