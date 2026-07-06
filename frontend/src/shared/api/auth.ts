import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/types/response';

const AUTH_API_PREFIX = '/auth';

export async function logout(): Promise<ApiResponse<Record<string, never>>> {
  const response = await api.post<ApiResponse<Record<string, never>>>(
    `${AUTH_API_PREFIX}/logout`,
  );

  return response.data;
}

export async function logoutAll(): Promise<ApiResponse<Record<string, never>>> {
  const response =
    await api.post<ApiResponse<Record<string, never>>>(`${AUTH_API_PREFIX}/logout-all`);

  return response.data;
}