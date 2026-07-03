import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString({ message: 'Current password must be a string' })
  currentPassword!: string;

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

  @IsNotEmpty({ message: 'Confirm new password is required' })
  @IsString({ message: 'Confirm new password must be a string' })
  confirmNewPassword!: string;
}
