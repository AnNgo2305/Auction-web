import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { OtpType } from '@generated/prisma/enums';

export class ResendOtpEmailDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({
    description: 'Purpose of the OTP',
    enum: OtpType,
    example: OtpType.VERIFY_EMAIL,
  })
  @IsNotEmpty({ message: 'OTP type is required' })
  @IsEnum(OtpType, { message: 'OTP type must be a valid value' })
  type!: OtpType;
}
