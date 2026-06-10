export class UserInfoResponseDto {
  userId!: string;

  email!: string;

  username!: string;

  password!: string;

  role!: string;

  isVerified!: boolean;

  isBanned!: boolean;

  failedLoginAttempts!: number;

  lockedUntil!: Date | null;
}
