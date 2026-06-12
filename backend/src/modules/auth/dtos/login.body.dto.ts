import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginBodyDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'Provider must be a string' })
  provider?: string;
}
