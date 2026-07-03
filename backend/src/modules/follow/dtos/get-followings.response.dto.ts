import type { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class FollowingsResponseDto {
  sellers: FollowUserDto[];

  nextCursor: string | null;
}
