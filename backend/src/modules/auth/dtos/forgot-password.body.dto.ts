import { IsEmail } from 'class-validator';

export class ForgotPasswordBodyDto {
  @IsEmail()
  email!: string;
}
