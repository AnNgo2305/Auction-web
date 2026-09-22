import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginBodyDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
  @ApiProperty({ description: 'User password', example: 'Password123!' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password!: string;
  @ApiPropertyOptional({
    description: 'Authentication provider',
    example: 'local',
    default: 'local',
  })
  @IsOptional()
  @IsString({ message: 'Provider must be a string' })
  provider?: string;
}
