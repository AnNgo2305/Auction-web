import type { Role } from '@generated/prisma/enums';
import type { RelationshipStatus } from '@modules/follow/follow.constant';

export interface RelationshipStatusResult {
  status: RelationshipStatus;

  friendshipId?: string;
}

export class FollowUserDto {
  userId!: string;

  username!: string;

  role!: Role;

  profileImageUrl?: string | null;

  relation?: RelationshipStatusResult;

  createdAt?: Date;
}
