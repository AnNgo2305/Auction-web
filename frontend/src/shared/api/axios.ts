import axios from 'axios';
import { toApiError } from './api-error.ts';
import { getCsrfToken } from '@/shared/api/csrf.ts';
import { emitLogoutEvent } from './auth-event.ts';
import { refreshAccessToken } from './auth-session.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  if (['post', 'put', 'patch', 'delete'].includes(method ?? '')) {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError<ApiResponseError>(error)) {
      return Promise.reject(new Error('An unexpected error occurred'));
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(toApiError(error));
    }

    const statusCode = error.response?.status;
    const errorCode = error.response?.data?.errorCode ?? '';
    const url = originalRequest?.url ?? '';

    if (statusCode === 500 && errorCode === 'INTERNAL_SERVER_ERROR') {
      emitLogoutEvent();
      return Promise.reject(toApiError(error));
    }

    if (!url.startsWith('/auth/')) {
      if (
        !originalRequest._retry &&
        errorCode === 'ACCESS_TOKEN_EXPIRED' &&
        statusCode === 401
      ) {
        originalRequest._retry = true;

        try {
          await refreshAccessToken();
          return api(originalRequest);
        } catch (refreshError) {
          emitLogoutEvent();
          if (refreshError instanceof Error) {
            return Promise.reject(refreshError);
          }

          return Promise.reject(new Error('Failed to refresh access token'));
        }
      }

      const shouldLogout =
        (statusCode === 401 &&
          [
            'MISSING_ACCESS_TOKEN',
            'INVALID_ACCESS_TOKEN',
            'UNKNOWN_ACCESS_TOKEN',
            'USER_IS_UNVERIFIED',
            'USER_NOT_EXIST',
          ].includes(errorCode)) ||
        (statusCode === 403 &&
          ['USER_IS_BANNED', 'USER_NOT_PERMISSION'].includes(errorCode)) ||
        (statusCode === 404 && ['USER_NOT_EXIST'].includes(errorCode));

      if (shouldLogout) {
        emitLogoutEvent();
        return Promise.reject(toApiError(error));
      }
    }

    return Promise.reject(toApiError(error));
  },
);
