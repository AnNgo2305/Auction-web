import type { ApiResponse } from '@/shared/types/response';
import type { Role } from '@/features/profile/types/profile/profile.type';
import type { RelationshipStatus } from '@/features/profile/types/profile/relationship.type.ts';

export class RelationshipStatusData {
  status!: RelationshipStatus;

  friendshipId?: string;
}

export class FollowUserData {
  userId!: string;

  username!: string;

  role!: Role;

  profileImageUrl?: string | null;

  relation?: RelationshipStatusData;
}

export class GetBlockedUsersData {
  blockedUsers!: FollowUserData[];

  nextCursor!: string | null;
}

export type GetBlockedUsersResponse = ApiResponse<GetBlockedUsersData>;
