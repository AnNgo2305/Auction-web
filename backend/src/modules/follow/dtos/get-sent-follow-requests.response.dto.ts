import type { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class SentFollowRequestsResponseDto {
  sentFollowRequests: FollowUserDto[];

  nextCursor: {
    createdAt: string;
    followId: string;
  } | null;
}
