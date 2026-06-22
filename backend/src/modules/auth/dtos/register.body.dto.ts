import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@generated/prisma/enums';

export class RegisterBodyDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, {
    message: 'Username must contain at least 3 characters',
  })
  @MaxLength(20, {
    message: 'Username cannot exceed 20 characters',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, {
    message: 'Password must contain at least 6 characters',
  })
  @MaxLength(100, {
    message: 'Password cannot exceed 100 characters',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/, {
    message: 'Password must contain at least one special character',
  })
  password!: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' })
  confirmPassword!: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, {
    message: 'Role must be either bidder or seller',
  })
  role!: Role;
}
