import type { UploadPurpose } from '@common/types/upload-file';

export const UPLOAD_RULES: Record<
  UploadPurpose,
  {
    maxSize: number;
    allowedMime: string[];
    maxFiles: number;
    roles: string[];
  }
> = {
  avatar: {
    maxSize: 5 * 1024 * 1024,
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    maxFiles: 1,
    roles: ['BIDDER', 'SELLER'],
  },

  cover: {
    maxSize: 10 * 1024 * 1024,
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    maxFiles: 1,
    roles: ['BIDDER', 'SELLER'],
  },
};

export const ERROR_INVALID_MIME_TYPE = {
  statusCode: 400,
  errorCode: 'INVALID_MIME_TYPE',
  message: 'Invalid file mime type',
};

export const ERROR_FILE_TOO_LARGE = {
  statusCode: 400,
  errorCode: 'FILE_TOO_LARGE',
  message: 'File size exceeds limit',
};

export const ERROR_FORBIDDEN_UPLOAD_PURPOSE = {
  statusCode: 403,
  errorCode: 'FORBIDDEN_UPLOAD_PURPOSE',
  message: 'You are not allowed to upload this file',
};

export const ERROR_TOO_MANY_FILES = {
  statusCode: 400,
  errorCode: 'TOO_MANY_FILES',
  message: 'Too many files uploaded',
};

export const ERROR_UPLOAD_CONFIRM_FAILED = {
  statusCode: 500,
  errorCode: 'UPLOAD_CONFIRM_FAILED',
  message: 'Failed to confirm uploaded file(s)',
};
