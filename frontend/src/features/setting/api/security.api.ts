import { api } from '@/shared/api/axios';
import type { ChangePasswordBody } from '@/features/setting/schemas/change-password.schema';
import type { ChangePasswordResponse } from '@/features/setting/types/change-password.response';
import type { GetActiveSessionsResponse } from '@/features/setting/types/get-active-sessions.response.ts';
import type { RevokeSessionResponse } from '@/features/setting/types/revoke-session.response.ts';

const PROFILE_API_PREFIX = '/profile';

export const securityApi = {
  changePassword: async (
    body: ChangePasswordBody,
  ): Promise<ChangePasswordResponse> => {
    const res = await api.patch<ChangePasswordResponse>(
      `${PROFILE_API_PREFIX}/password`,
      body,
    );

    return res.data;
  },

  getActiveSessions: async (): Promise<GetActiveSessionsResponse> => {
    const res = await api.get<GetActiveSessionsResponse>(
      `${PROFILE_API_PREFIX}/sessions`,
    );

    return res.data;
  },

  revokeSession: async (sessionId: string): Promise<RevokeSessionResponse> => {
    const res = await api.delete<RevokeSessionResponse>(
      `${PROFILE_API_PREFIX}/sessions/${sessionId}`,
    );

    return res.data;
  },
};
