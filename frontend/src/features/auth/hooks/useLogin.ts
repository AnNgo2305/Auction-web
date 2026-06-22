import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { toast } from 'sonner';
import type { ApiResponseError } from '@/shared/types/error';
import type { LoginResponse } from '../types/login.response';
import type { LoginBody } from '@/features/auth/schemas/login.schema';
import { LOGIN_ERROR_MESSAGES } from '../constants/auth-error.messages.ts'

export function useLogin(onSuccessCallback?: (res: LoginResponse) => void) {
  return useMutation<LoginResponse, ApiResponseError, LoginBody>({
    mutationFn: authApi.login,

    onSuccess: (res: LoginResponse) => {
      onSuccessCallback?.(res);
    },

    onError: (err: ApiResponseError) => {
      const code = err?.errorCode;

      const message =
        (code && LOGIN_ERROR_MESSAGES[code]) ?? LOGIN_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
