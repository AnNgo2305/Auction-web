import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { toast } from 'sonner';
import type { ApiResponseError } from '@/shared/types/error';
import type { RegisterResponse } from '@/features/auth/types/register.response';
import type { RegisterBody } from '@/features/auth/schemas/register.schema';
import { REGISTER_ERROR_MESSAGES } from '../constants/auth-error.messages.ts';

export function useRegister(onSuccessCallback?: (res: RegisterResponse) => void) {
  return useMutation<RegisterResponse, ApiResponseError, RegisterBody>({
    mutationFn: authApi.register,

    onSuccess: (res: RegisterResponse) => {
      toast.success(res.data.message);
      onSuccessCallback?.(res);
    },

    onError: (err: ApiResponseError) => {
      const code = err?.errorCode;

      const message =
        (code && REGISTER_ERROR_MESSAGES[code]) ||
        REGISTER_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
