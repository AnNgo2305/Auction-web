import { OtpType } from '@generated/prisma/enums';
import { IsEnum, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  userId!: string;

  @IsEnum(OtpType)
  type!: OtpType;

  @IsString()
  code!: string;
}
