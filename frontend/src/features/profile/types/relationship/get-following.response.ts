import type { ApiResponse } from '@/shared/types/response.ts';
import type { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';
import type { Role } from '@/features/profile/types/profile/profile.type';

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
