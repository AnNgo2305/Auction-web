import { ApiProperty } from '@nestjs/swagger';
import { OtpType } from '@generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  userId!: string;

  @ApiProperty({
    description: 'Purpose of the OTP',
    enum: OtpType,
    example: OtpType.VERIFY_EMAIL,
  })
  @IsNotEmpty({ message: 'OTP type is required' })
  @IsEnum(OtpType, {
    message: 'OTP type must be a valid value',
  })
  type!: OtpType;

  @ApiProperty({
    description: 'Six-digit OTP code',
    example: '123456',
    pattern: '^\\d{6}$',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString({ message: 'OTP code must be a string' })
  @Matches(/^\d{6}$/, {
    message: 'OTP code must contain exactly 6 digits',
  })
  code!: string;
}
