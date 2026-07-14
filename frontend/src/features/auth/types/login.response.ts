import type { ApiResponse } from '@/shared/types/response';
import type { Role } from '@/shared/types/user.ts';

export class LoginData {
  user!: {
    userId: string;

    email: string;

    username: string;

    role: Role;

    isVerified: boolean;

    isBanned: boolean;

    provider: string;

    profileImageUrl: string | null;

    coverImageUrl: string | null;
  };

  otpRequired?: boolean;
}

export type LoginResponse = ApiResponse<LoginData>;
