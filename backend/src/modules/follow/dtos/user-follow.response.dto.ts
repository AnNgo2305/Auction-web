import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums';
import { RelationshipStatus } from '@modules/follow/follow.constant';

export class RelationshipStatusResult {
  @ApiProperty({
    description: 'Current relationship status',
    example: 'FOLLOWING',
  })
  status!: RelationshipStatus;

  @ApiPropertyOptional({
    description: 'Friendship ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  friendshipId?: string;
}

export class FollowUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username!: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.BIDDER,
  })
  role!: Role;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    nullable: true,
    example: 'https://example.com/profile.jpg',
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Relationship with the current user',
    type: RelationshipStatusResult,
  })
  relation?: RelationshipStatusResult;

  @ApiPropertyOptional({
    description: 'Date when the relationship was created',
    example: '2026-09-23T08:00:00.000Z',
  })
  createdAt?: Date;
}
