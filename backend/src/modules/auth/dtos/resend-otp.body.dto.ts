import { IsEmail, IsEnum } from 'class-validator';
import { OtpType } from '@generated/prisma/enums';

export class ResendOtpEmailDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsEnum(OtpType, { message: 'Invalid OTP type' })
  type!: OtpType;
}
