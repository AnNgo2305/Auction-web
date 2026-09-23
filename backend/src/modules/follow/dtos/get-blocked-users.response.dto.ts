import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BlockedUsersResponseDto {
  @ApiProperty({
    description: 'List of blocked users',
    type: [FollowUserDto],
  })
  blockedUsers!: FollowUserDto[];

  @ApiProperty({
    description: 'Cursor for the next page',
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA5LTIzVDA4OjAwOjAwLjAwMFoifQ',
  })
  nextCursor!: string | null;
}
