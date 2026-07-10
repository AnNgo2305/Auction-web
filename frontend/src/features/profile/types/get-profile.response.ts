import type { ApiResponse } from '@/shared/types/response';
import type { Gender, Role } from '@/features/profile/types/profile.type';
import { RelationshipStatus } from '@/features/profile/types/relationship.type';

export class GetProfileData {
  userId!: string;

  email!: string;

  username!: string;

  role!: Role;

  createdAt!: string;

  updatedAt!: string;

  fullName!: string | null;

  phoneNumber!: string | null;

  bio!: string | null;

  dateOfBirth!: string | null;

  gender!: Gender | null;

  profileImageUrl!: string | null;

  coverImageUrl!: string | null;

  followerCount?: number;

  followingCount?: number;

  relationship!: {
    status: RelationshipStatus;
    friendshipId?: string;
  };

  mutualFollowedSellerCount?: number;
}

export type GetProfileResponse = ApiResponse<GetProfileData>;
