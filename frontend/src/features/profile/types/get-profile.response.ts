import type { ApiResponse } from '@/shared/types/response';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export class GetProfileData {
  userId!: string;

  email!: string;

  username!: string;

  role!: string;

  createdAt!: string;

  updatedAt!: string;

  fullName!: string | null;

  phoneNumber!: string | null;

  bio!: string | null;

  dateOfBirth!: string | null;

  gender!: string | null;

  profileImageUrl!: string | null;

  coverImageUrl!: string | null;

  followerCount?: number;

  followingCount?: number;

  relationship!: {
    status: string;
    friendshipId: string | null;
  };

  mutualFollowedSellerCount?: number;
}

export type GetProfileResponse = ApiResponse<GetProfileData>;
