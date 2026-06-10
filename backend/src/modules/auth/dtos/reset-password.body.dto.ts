import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  resetPasswordToken!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;

  @IsString()
  @MinLength(6)
  confirmNewPassword!: string;
}
