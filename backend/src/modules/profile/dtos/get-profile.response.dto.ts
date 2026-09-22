import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums';
import { RelationshipStatus } from '@modules/follow/follow.constant';

export class GetProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'nguyenvana',
  })
  username!: string;

  @ApiProperty({
    description: 'User role',
    enum: ['USER', 'SELLER', 'ADMIN'],
    example: 'USER',
  })
  role!: Role;

  @ApiProperty({
    description: 'Account creation date',
    example: '2026-01-15T08:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last account update date',
    example: '2026-09-22T05:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'User full name',
    nullable: true,
    example: 'Nguyen Van A',
  })
  fullName?: string | null;

  @ApiPropertyOptional({
    description: 'User phone number',
    nullable: true,
    example: '0123456789',
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    description: 'User biography',
    nullable: true,
    example: 'Software developer',
  })
  bio?: string | null;

  @ApiPropertyOptional({
    description: 'URL of the user profile image',
    nullable: true,
    example: 'https://example.com/avatar.jpg',
  })
  profileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'User date of birth',
    nullable: true,
    example: '2000-01-01',
    type: String,
    format: 'date',
  })
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({
    description: 'User gender',
    nullable: true,
    example: 'MALE',
  })
  gender?: string | null;

  @ApiPropertyOptional({
    description: 'URL of the user cover image',
    nullable: true,
    example: 'https://example.com/cover.jpg',
  })
  coverImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Number of followers',
    example: 120,
  })
  followerCount?: number;

  @ApiPropertyOptional({
    description: 'Number of users this user follows',
    example: 85,
  })
  followingCount?: number;

  @ApiPropertyOptional({
    description: 'Number of sellers followed by both users',
    example: 5,
  })
  mutualFollowedSellerCount?: number;

  @ApiProperty({
    description: 'Relationship between the current user and the profile owner',
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'FOLLOWING',
      },
      friendshipId: {
        type: 'string',
        nullable: true,
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  relationship!: {
    status: RelationshipStatus;
    friendshipId?: string;
  };
}
