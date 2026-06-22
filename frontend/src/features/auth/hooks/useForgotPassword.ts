import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { toast } from 'sonner';
import type { ForgotPasswordBody } from '../schemas/forgot-password.schema';
import type { ApiResponseError } from '@/shared/types/error.ts';
import type { ForgotPasswordResponse } from '@/features/auth/types/forgot-password.response.ts';

export function useForgotPassword(
  onSuccessCallback?: (res: ForgotPasswordResponse) => void,
) {
  return useMutation<
    ForgotPasswordResponse,
    ApiResponseError,
    ForgotPasswordBody
  >({
    mutationFn: authApi.forgotPassword,

    onSuccess: (res) => {
      toast.success(
        'We’ve sent a verification code to your email. Please check your inbox.',
      );

      onSuccessCallback?.(res);
    },
  });
}
