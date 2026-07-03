import type { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class ReceivedFollowRequestsCursorResponseDto {
  receivedFollowRequests: FollowUserDto[];

  nextCursor: string | null;
}
