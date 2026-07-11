import type { VerifyResetPasswordOtpResponse } from '@/features/auth/types/verify-reset-password-otp.response';
import { useMutation } from '@tanstack/react-query';
import type { ApiResponseError } from '@/shared/types/error';
import type { VerifyOtpBody } from '@/features/auth/schemas/verify-otp.schema';
import { authApi } from '@/features/auth/api/auth.api';
import { toast } from 'sonner';

export function useVerifyResetPasswordlOTP(onSuccessCallback?: (res: VerifyResetPasswordOtpResponse) => void ) {
  return useMutation<
    VerifyResetPasswordOtpResponse,
    ApiResponseError,
    VerifyOtpBody
  >({
    mutationFn: async (body: VerifyOtpBody): Promise<VerifyResetPasswordOtpResponse> => {
      return await authApi.verifyResetPasswordOTP(body);
    },

    onSuccess: (res: VerifyResetPasswordOtpResponse) => {
      toast.success(res.message);
      onSuccessCallback?.(res);
    },
  });
}