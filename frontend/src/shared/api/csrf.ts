import { api } from './axios';
import type { ApiResponse } from '@/shared/types/response.ts';

let csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function clearCsrfToken() {
  csrfToken = null;
}

const CSRF_API_URL = '/auth/csrf-token';
export interface CsrfToken {
  csrfToken: string;
}

export async function initializeCsrf() {
  const response = await api.get<ApiResponse<CsrfToken>>(CSRF_API_URL);

  setCsrfToken(response.data.data.csrfToken);
}
