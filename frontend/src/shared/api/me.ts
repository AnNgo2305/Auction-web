import { api } from './axios';
import type { ApiResponse } from '@/shared/types/response';
import type { CurrentUser } from '@/shared/types/current-user';

const USER_API_PREFIX = '/users';

export async function getMe(): Promise<ApiResponse<CurrentUser>> {
  const response = await api.get<ApiResponse<CurrentUser>>(
    `${USER_API_PREFIX}/me`,
  );

  return response.data;
}
