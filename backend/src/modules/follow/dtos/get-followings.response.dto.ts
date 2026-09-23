import { ApiProperty } from '@nestjs/swagger';
import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class FollowingsResponseDto {
  @ApiProperty({
    description: 'List of sellers followed by the bidder',
    type: [FollowUserDto],
  })
  sellers!: FollowUserDto[];

  @ApiProperty({
    description: 'Cursor for the next page',
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA5LTIzVDA4OjAwOjAwLjAwMFoifQ',
  })
  nextCursor!: string | null;
}
