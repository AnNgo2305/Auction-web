import { ApiProperty } from '@nestjs/swagger';
import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class FollowersResponseDto {
  @ApiProperty({
    description: 'List of followers',
    type: [FollowUserDto],
  })
  bidders: FollowUserDto[];

  @ApiProperty({
    description: 'Cursor for the next page',
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA5LTIzVDA4OjAwOjAwLjAwMFoifQ',
  })
  nextCursor: string | null;
}
