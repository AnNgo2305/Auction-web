import { IsString } from 'class-validator';

export class LogoutAllBodyDto {
  @IsString()
  userId!: string;

  @IsString()
  refreshToken!: string;
}
