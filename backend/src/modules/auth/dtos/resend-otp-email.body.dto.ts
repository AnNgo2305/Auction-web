import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OtpType } from '@generated/prisma/enums';

export class ResendOtpEmailDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsNotEmpty({ message: 'OTP type is required' })
  @IsEnum(OtpType, {
    message: 'OTP type must be a valid value',
  })
  type!: OtpType;
}
