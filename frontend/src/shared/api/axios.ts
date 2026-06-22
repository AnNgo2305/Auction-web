import axios from 'axios';
import { toApiError } from './api-error.ts';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const REFRESH_TOKEN_API_URL = '/auth/refresh-token';

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;
    const errorCode = error.response?.data?.errorCode;
    const url = originalRequest?.url || '';

    if (statusCode === 500 && errorCode === 'INTERNAL_SERVER_ERROR') {
      // logout
      return Promise.reject(toApiError(error));
    }

    if (!url.startsWith('/auth/')) {
      if (
        !originalRequest._retry &&
        errorCode === 'ACCESS_TOKEN_EXPIRED' &&
        statusCode === 401
      ) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;
        try {
          await api.post(REFRESH_TOKEN_API_URL);
          processQueue(null);
          return api(originalRequest);
        } catch (refreshError) {
          // logout
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
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
        (statusCode === 404 && ['USER_NOT_EXIST']);

      if (shouldLogout) {
        // logout
        return Promise.reject(toApiError(error));
      }

      return Promise.reject(toApiError(error));
    }

    return Promise.reject(toApiError(error));
  },
);
