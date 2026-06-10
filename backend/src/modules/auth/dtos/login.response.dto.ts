export class LoginResponseDto {
  user!: {
    userId: string;

    email: string;

    role: string;

    username: string;

    isVerified: boolean;

    isBanned: boolean;

    provider: string;
  };
}
