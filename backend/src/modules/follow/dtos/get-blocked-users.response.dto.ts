import type { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class BlockedUsersResponseDto {
  blockedUsers: FollowUserDto[];

  nextCursor: string | null;
}
