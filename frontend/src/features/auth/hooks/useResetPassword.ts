import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/auth.api';
import { toast } from 'sonner';
import type { ApiResponseError } from '@/shared/types/error.ts';
import type { ResetPasswordResponse } from '@/features/auth/types/reset-password.response.ts';
import type { ResetPasswordBody } from '@/features/auth/schemas/reset-password.schema.ts';
import { RESET_PASSWORD_ERROR_MESSAGES } from '@/features/auth/constants/auth-error.messages.ts';

export function useResetPassword(onCallback?: () => void) {
  return useMutation<
    ResetPasswordResponse,
    ApiResponseError,
    ResetPasswordBody
  >({
    mutationFn: async (body: ResetPasswordBody): Promise<ResetPasswordResponse> => {
      return await authApi.resetPassword(body);
    },

    onSuccess: (res) => {
      toast.success(res.message);
      onCallback?.();
    },

    onError: (error) => {
      const code = error?.errorCode;

      const message =
        (code && RESET_PASSWORD_ERROR_MESSAGES[code]) ||
        RESET_PASSWORD_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
      onCallback?.();
    },
  });
}
