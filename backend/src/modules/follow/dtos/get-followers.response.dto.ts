import type { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class FollowersResponseDto {
  bidders: FollowUserDto[];

  nextCursor: string | null;
}
