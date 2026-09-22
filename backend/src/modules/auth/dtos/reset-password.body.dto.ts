import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Temporary token used to reset the password',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'Reset password token is required' })
  @IsString({ message: 'Reset password token must be a string' })
  resetPasswordToken!: string;

  @ApiProperty({
    description:
      'New password. Must contain at least 6 characters, one uppercase letter, one number, and one special character.',
    example: 'NewPassword123!',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(6, {
    message: 'New password must contain at least 6 characters',
  })
  @MaxLength(100, {
    message: 'New password cannot exceed 100 characters',
  })
  @Matches(/[A-Z]/, {
    message: 'New password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'New password must contain at least one number',
  })
  @Matches(/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/, {
    message: 'New password must contain at least one special character',
  })
  newPassword!: string;

  @ApiProperty({
    description:
      'Confirmation of the new password. Must contain at least 6 characters, one uppercase letter, one number, and one special character.',
    example: 'NewPassword123!',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' })
  @MinLength(6, {
    message: 'Confirm password must contain at least 6 characters',
  })
  @MaxLength(100, {
    message: 'Confirm password cannot exceed 100 characters',
  })
  @Matches(/[A-Z]/, {
    message: 'Confirm password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Confirm password must contain at least one number',
  })
  @Matches(/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/, {
    message: 'Confirm password must contain at least one special character',
  })
  confirmNewPassword!: string;
}
