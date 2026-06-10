import { Role } from '@generated/prisma/enums';

export class GetProfileResponseDto {
  userId!: string;

  email!: string;

  username!: string;

  role!: Role;

  createdAt!: Date;

  updatedAt!: Date;

  fullName?: string | null;

  phoneNumber?: string | null;

  profileImageUrl?: string | null;

  followerCount?: number;

  followingCount?: number;

  followStatus!: 'UNFOLLOWING' | 'PENDING' | 'ACTIVE' | 'UNKNOWN';
}
