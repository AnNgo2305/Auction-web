import type { ApiResponse } from '@/shared/types/response.ts';

export class VerifyResetPasswordOtpData {
  resetPasswordToken!: string;
}

export type VerifyResetPasswordOtpResponse =
  ApiResponse<VerifyResetPasswordOtpData>;
