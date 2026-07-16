import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { securityApi } from '@/features/setting/api/security.api';

import type { ApiResponseError } from '@/shared/types/error';
import type { ChangePasswordBody } from '@/features/setting/schemas/change-password.schema';
import type { ChangePasswordResponse } from '@/features/setting/types/change-password.response';
import { CHANGE_PASSWORD_ERROR_MESSAGES } from '@/features/setting/constants/security-error.messages';

export function useChangePassword(onCallback?: () => void) {
  return useMutation<
    ChangePasswordResponse,
    ApiResponseError,
    ChangePasswordBody
  >({
    mutationFn: async (
      body: ChangePasswordBody,
    ): Promise<ChangePasswordResponse> => {
      return await securityApi.changePassword(body);
    },

    onSuccess: (res) => {
      toast.success(res.message);
      onCallback?.();
    },

    onError: (error) => {
      const code = error?.errorCode;

      const message =
        (code && CHANGE_PASSWORD_ERROR_MESSAGES[code]) ||
        CHANGE_PASSWORD_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
