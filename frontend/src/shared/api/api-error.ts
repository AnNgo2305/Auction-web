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

const normalizeValidationMessage = (
  message: Record<string, string[]>,
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(message).map(([field, values]) => [
      field,
      values?.[0] ?? 'Invalid value',
    ]),
  );
};

export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.fieldErrors = fieldErrors;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const toApiError = (error: unknown): ApiError => {
  console.log(123);
  console.log(error);
  console.log(456)
  if (!axios.isAxiosError<ApiResponseError>(error)) {
    console.log(1);
    console.log(error);
    return new ApiError(errorMessage.UNKNOWN_ERROR, 500, 'UNKNOWN_ERROR');
  }
  const axiosError = error as AxiosError<ApiResponseError>;
  const data = axiosError.response?.data;
  const errorCode = data?.errorCode ?? 'UNKNOWN_ERROR';
  const statusCode = data?.statusCode ?? axiosError.response?.status ?? 500;

  console.log(7);
  let message: string;
  let fieldErrors: Record<string, string> | undefined;

  console.log(8);
  if (
    statusCode === 400 &&
    errorCode === 'CLASS_VALIDATION_FAILED' &&
    typeof data?.message === 'object'
  ) {
    fieldErrors = normalizeValidationMessage(
      data?.message as Record<string, string[]>,
    );
    message = 'Validation failed';
  } else {
    message =
      errorMessage[errorCode as keyof typeof errorMessage] ??
      data?.message ??
      axiosError.message ??
      errorMessage.UNKNOWN_ERROR;
  }

  console.log(9)
  return new ApiError(message, statusCode, errorCode, fieldErrors);
};
