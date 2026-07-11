import { useMutation } from '@tanstack/react-query';
import type { ResendOtpEmailResponse } from '@/features/auth/types/resend-otp-email.response.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';
import type { ResendOtpEmailBody } from '@/features/auth/schemas/resend-otp-email.schema.ts';
import { authApi } from '@/features/auth/api/auth.api.ts';
import type { VerifyEmailOtpResponse } from '@/features/auth/types/verify-email-otp.response.ts';
import { toast } from 'sonner';
import { RESEND_OTP_ERROR_MESSAGES } from '@/features/auth/constants/auth-error.messages.ts';

export function useResendOTPEmail(
  onSuccessCallback?: () => void,
  onErrorCallback?: (error: ApiResponseError) => void,
) {
  return useMutation<
    ResendOtpEmailResponse,
    ApiResponseError,
    ResendOtpEmailBody
  >({
    mutationFn: async (body: ResendOtpEmailBody): Promise<ResendOtpEmailResponse> => {
      return await authApi.resendOtp(body);
    },

    onSuccess: (res: VerifyEmailOtpResponse) => {
      toast.success(res.message ?? 'OTP email has been sent successfully.');
      onSuccessCallback?.();
    },

    onError: (error: ApiResponseError) => {
      const code = error?.errorCode;
      const message =
        (code && RESEND_OTP_ERROR_MESSAGES[code]) ||
        RESEND_OTP_ERROR_MESSAGES.DEFAULT;
      toast.error(message);
      onErrorCallback?.(error);
    },
  });
}