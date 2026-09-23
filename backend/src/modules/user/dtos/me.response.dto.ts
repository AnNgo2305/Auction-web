import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
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

  @ApiProperty({ description: 'Username', example: 'nguyenvana' })
  username!: string;

  @ApiProperty({ description: 'User role', example: 'BIDDER' })
  role!: string;

  @ApiProperty({
    description: 'Public profile image URL',
    nullable: true,
    example: 'https://example.com/avatar.jpg',
  })
  profileImageUrl!: string | null;

  @ApiProperty({
    description: 'Public cover image URL',
    nullable: true,
    example: 'https://example.com/cover.jpg',
  })
  coverImageUrl!: string | null;
}
