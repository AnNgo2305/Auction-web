import type { ApiResponse } from '@/shared/types/response';
import type { Role } from '@/shared/types/user.ts';
import type { RelationshipStatus } from '@/shared/types/relationship.ts';

export type FollowCursor = {
  createdAt: string;
  followId: string;
};

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

  createdAt!: string;
}

export class GetPendingFollowRequestsData {
  receivedFollowRequests!: FollowUserData[];

  nextCursor!: FollowCursor | null;
}

export type GetPendingFollowRequestsResponse =
  ApiResponse<GetPendingFollowRequestsData>;
