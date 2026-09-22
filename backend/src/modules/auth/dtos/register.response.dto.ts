import { ApiProperty } from '@nestjs/swagger';
export class RegisterResponseDto {
  @ApiProperty({
    description: 'Newly created user ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Registered user email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Registration result message',
    example:
      'Registration successful. Please check your email for verification.',
  })
  message!: string;
}
