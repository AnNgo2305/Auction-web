import { OtpType } from '@generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  userId!: string;

  @IsNotEmpty({ message: 'OTP type is required' })
  @IsEnum(OtpType, {
    message: 'OTP type must be a valid value',
  })
  type!: OtpType;

  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString({ message: 'OTP code must be a string' })
  @Matches(/^\d{6}$/, {
    message: 'OTP code must contain exactly 6 digits',
  })
  code!: string;
}
