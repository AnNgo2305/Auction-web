import type { ApiResponse } from '@/shared/types/response';

export class LoginData {
  user!: {
    userId: string;

    email: string;

    username: string;

    role: string;

    isVerified: boolean;

    isBanned: boolean;

    provider: string;
  }

  otpRequired?: boolean;
}

export type LoginResponse = ApiResponse<LoginData>;
