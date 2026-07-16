import { useQuery } from '@tanstack/react-query';
import { securityApi } from '@/features/setting/api/security.api';
import type { ApiResponseError } from '@/shared/types/error';
import type {
  GetActiveSessionsResponse,
  ActiveSessionData,
} from '@/features/setting/types/get-active-sessions.response';
import { sessionKeys } from '@/features/setting/constants/sesion-query-key.ts';

export function useGetActiveSessions() {
  return useQuery<
    GetActiveSessionsResponse,
    ApiResponseError,
    ActiveSessionData[]
  >({
    queryKey: sessionKeys.active(),
    queryFn: async (): Promise<GetActiveSessionsResponse> => {
      return await securityApi.getActiveSessions();
    },
    select: (response) => response.data,
    staleTime: 1000 * 30,
  });
}
