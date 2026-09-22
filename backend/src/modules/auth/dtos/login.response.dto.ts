import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class LoginResponseDto {
  @ApiProperty({
    description: 'Authenticated user information',
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      role: { type: 'string', example: 'USER' },
      username: { type: 'string', example: 'nguyenvana' },
      isVerified: { type: 'boolean', example: true },
      isBanned: { type: 'boolean', example: false },
      provider: { type: 'string', example: 'local' },
      profileImageUrl: {
        type: 'string',
        nullable: true,
        example: 'https://example.com/avatar.jpg',
      },
      coverImageUrl: {
        type: 'string',
        nullable: true,
        example: 'https://example.com/cover.jpg',
      },
    },
  })
  user!: {
    userId: string;
    email: string;
    role: string;
    username: string;
    isVerified: boolean;
    isBanned: boolean;
    provider: string;
    profileImageUrl: string | null;
    coverImageUrl: string | null;
  };

  @ApiPropertyOptional({
    description:
      'Whether an OTP is required to complete the authentication flow',
    example: true,
  })
  otpRequired?: boolean;
}
