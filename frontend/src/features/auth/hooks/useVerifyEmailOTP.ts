import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type { VerifyEmailOtpResponse } from '../types/verify-email-otp.response';
import { toast } from 'sonner';
import type { ApiResponseError } from '@/shared/types/error';
import type { VerifyOtpBody } from '@/features/auth/schemas/verify-otp.schema';

export function useVerifyEmailOTP(onSuccessCallback?: () => void) {
  return useMutation<
    VerifyEmailOtpResponse,
    ApiResponseError,
    VerifyOtpBody
  >({
    mutationFn: authApi.verifyEmailOTP,

    onSuccess: (res: VerifyEmailOtpResponse) => {
      toast.success(res.message);
      onSuccessCallback?.();
    },
  });
}
