import type { ApiResponse } from '@/shared/types/response';

export class LoginData {
  user!: {
    userId: string;

    email: string;

    username: string;

    role: 'BIDDER' | 'SELLER';

    isVerified: boolean;

    isBanned: boolean;

    provider: string;

    profileImageUrl: string | null;

    coverImageUrl: string | null;
  };

  otpRequired?: boolean;
}

export type LoginResponse = ApiResponse<LoginData>;
