import { useMutation, useQueryClient } from '@tanstack/react-query';
import { securityApi } from '@/features/setting/api/security.api';
import type { ApiResponseError } from '@/shared/types/error';
import type { RevokeSessionResponse } from '@/features/setting/types/revoke-session.response';
import { toast } from 'sonner';
import { sessionKeys } from '@/features/setting/constants/sesion-query-key.ts';
import { REVOKE_SESSION_ERROR_MESSAGES } from '@/features/setting/constants/security-error.messages.ts';

export function useRevokeSession(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<RevokeSessionResponse, ApiResponseError, string>({
    mutationFn: async (sessionId: string): Promise<RevokeSessionResponse> => {
      return await securityApi.revokeSession(sessionId);
    },

    onSuccess: async (res) => {
      toast.success(res.message);

      await queryClient.invalidateQueries({
        queryKey: sessionKeys.active(),
      });

      onSuccess?.();
    },

    onError: (error) => {
      const message =
        REVOKE_SESSION_ERROR_MESSAGES[error.errorCode] ??
        REVOKE_SESSION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
