import { ApiProperty } from '@nestjs/swagger';
import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class SentFollowRequestsCursorDto {
  @ApiProperty({
    description: 'Creation timestamp used as part of the pagination cursor',
    example: '2026-09-23T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Follow request ID used as part of the pagination cursor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  followId!: string;
}

export class SentFollowRequestsResponseDto {
  @ApiProperty({
    description: 'List of sent follow requests',
    type: [FollowUserDto],
  })
  sentFollowRequests!: FollowUserDto[];

  @ApiProperty({
    description: 'Cursor for the next page',
    type: SentFollowRequestsCursorDto,
    nullable: true,
  })
  nextCursor!: SentFollowRequestsCursorDto | null;
}
