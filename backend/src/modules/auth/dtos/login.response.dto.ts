export class LoginResponseDto {
  user!: {
    userId: string;

    email: string;

    role: string;

    username: string;

    isVerified: boolean;

    isBanned: boolean;

    provider: string;

    profileImageUrl: string | null;

    coverImageUrl: string | null;
  };

  otpRequired?: boolean;
}
