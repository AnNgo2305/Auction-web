import { ApiProperty } from '@nestjs/swagger';
import { FollowUserDto } from '@modules/follow/dtos/user-follow.response.dto';

export class ReceivedFollowRequestsCursorDto {
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

export class ReceivedFollowRequestsCursorResponseDto {
  @ApiProperty({
    description: 'List of received follow requests',
    type: [FollowUserDto],
  })
  receivedFollowRequests!: FollowUserDto[];

  @ApiProperty({
    description: 'Cursor for the next page',
    type: ReceivedFollowRequestsCursorDto,
    nullable: true,
  })
  nextCursor!: ReceivedFollowRequestsCursorDto | null;
}
