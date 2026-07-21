import type {
  DocumentMimeType,
  ImageMimeType,
  UploadPurpose,
} from '@common/types/upload-file';
import { DOCUMENT_MIME_TYPE, IMAGE_MIME_TYPE } from '@common/types/upload-file';
import { Role } from '@generated/prisma/enums';
import {
  MAX_PRODUCT_DOCUMENTS,
  MAX_PRODUCT_IMAGES,
} from '@modules/product/product.constant';

export const UPLOAD_RULES: Record<
  UploadPurpose,
  {
    maxSize: number;
    allowedMime: ImageMimeType[] | DocumentMimeType[];
    maxFiles: number;
    roles: Role[];
  }
> = {
  avatar: {
    maxSize: 5 * 1024 * 1024,
    allowedMime: [
      IMAGE_MIME_TYPE.JPEG,
      IMAGE_MIME_TYPE.JPG,
      IMAGE_MIME_TYPE.PNG,
      IMAGE_MIME_TYPE.WEBP,
    ],
    maxFiles: 1,
    roles: [Role.SELLER, Role.BIDDER],
  },

  cover: {
    maxSize: 10 * 1024 * 1024,
    allowedMime: [
      IMAGE_MIME_TYPE.JPEG,
      IMAGE_MIME_TYPE.JPG,
      IMAGE_MIME_TYPE.PNG,
      IMAGE_MIME_TYPE.WEBP,
    ],
    maxFiles: 1,
    roles: [Role.SELLER, Role.BIDDER],
  },

  productImage: {
    maxSize: 10 * 1024 * 1024,
    allowedMime: [
      IMAGE_MIME_TYPE.JPEG,
      IMAGE_MIME_TYPE.JPG,
      IMAGE_MIME_TYPE.PNG,
      IMAGE_MIME_TYPE.WEBP,
    ],
    maxFiles: MAX_PRODUCT_IMAGES,
    roles: [Role.SELLER],
  },

  productDocument: {
    maxSize: 100 * 1024 * 1024,
    allowedMime: [
      DOCUMENT_MIME_TYPE.PDF,
      DOCUMENT_MIME_TYPE.DOC,
      DOCUMENT_MIME_TYPE.DOCX,
      DOCUMENT_MIME_TYPE.XLS,
      DOCUMENT_MIME_TYPE.XLSX,
      DOCUMENT_MIME_TYPE.PPT,
      DOCUMENT_MIME_TYPE.PPTX,
      DOCUMENT_MIME_TYPE.TXT,
      DOCUMENT_MIME_TYPE.CSV,
    ],
    maxFiles: MAX_PRODUCT_DOCUMENTS,
    roles: [Role.SELLER],
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
