import axios, { type AxiosError } from 'axios';
import type { ApiResponseError } from '../types/error.ts';

const errorMessage = {
  INTERNAL_SERVER_ERROR:
    'Something went wrong on our side. Please try again in a moment.',

  MISSING_ACCESS_TOKEN: 'Please sign in to continue.',
  INVALID_ACCESS_TOKEN:
    'Your session has expired. Please sign in again to continue.',
  UNKNOWN_ACCESS_TOKEN:
    'Your session has expired. Please sign in again to continue.',

  USER_IS_BANNED: 'Your account has been suspended.',
  USER_NOT_PERMISSION: "You don't have permission to perform this action.",
  USER_IS_UNVERIFIED: 'Please verify your account to continue.',
  USER_NOT_EXIST: 'This account can’t be found anymore.',

  MISSING_REFRESH_TOKEN: 'Please sign in to continue.',
  REFRESH_TOKEN_EXPIRED:
    'Your session has expired. Please log in again to continue.',
  INVALID_REFRESH_TOKEN:
    'Your session has expired. Please sign in again to continue.',
  UNKNOWN_REFRESH_TOKEN:
    'Your session has expired. Please sign in again to continue.',
  REFRESH_TOKEN_NOT_FOUND:
    'Your session has expired. Please sign in again to continue.',

  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError<ApiResponseError>(error)) {
    return new ApiError(errorMessage.UNKNOWN_ERROR, 500, 'UNKNOWN_ERROR');
  }
  const axiosError = error as AxiosError<ApiResponseError>;
  if (axiosError.code === 'ECONNABORTED') {
    return new ApiError(
      'The request took too long. Please try again.',
      408,
      'REQUEST_TIMEOUT',
    );
  }

  if (!axiosError.response) {
    return new ApiError(
      'Unable to connect to the server. Please check your internet connection.',
      0,
      'NETWORK_ERROR',
    );
  }

  const data = axiosError.response.data;
  const errorCode = data?.errorCode ?? 'UNKNOWN_ERROR';
  const statusCode = data?.statusCode ?? axiosError.response?.status ?? 500;

  const message =
    errorMessage[errorCode as keyof typeof errorMessage] ??
    data?.message ??
    axiosError.message ??
    errorMessage.UNKNOWN_ERROR;

  return new ApiError(message, statusCode, errorCode);
};
