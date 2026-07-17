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

  profileImageUrl!: string | null;

  relation?: RelationshipStatusData;

  createdAt!: string ;
}

export class GetSentFollowRequestsData {
  sentFollowRequests!: FollowUserData[];

  nextCursor!: string | null;
}

export type GetSentFollowRequestsResponse =
  ApiResponse<GetSentFollowRequestsData>;
