import type { ApiResponse } from '@/shared/types/response';

export class ForgotPasswordData {
  userId!: string;

  email!: string;
}

export type ForgotPasswordResponse = ApiResponse<ForgotPasswordData>;
