import type { ApiResponse } from '@/shared/types/response.ts';
import type { Role } from '@/shared/types/user.ts';
import type { RelationshipStatus } from '@/shared/types/relationship.ts';

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

export class GetFollowingsData {
  sellers!: FollowUserData[];

  nextCursor!: string | null;
}

export type GetFollowingsResponse = ApiResponse<GetFollowingsData>;
