export const UPLOAD_PURPOSES = {
  AVATAR: 'avatar',
  COVER: 'cover',
} as const;

export type UploadPurpose =
  (typeof UPLOAD_PURPOSES)[keyof typeof UPLOAD_PURPOSES];

export interface FileMetadata {
  originalFileName: string;
  mimeType: string;
  size: number;
}

export interface CreatePresignedUrlsRequest {
  purpose: UploadPurpose;
  files: FileMetadata[];
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
}

export interface CreatePresignedUrlsResponse {
  urls: PresignedUrlResult[];
}

export interface ConfirmUploadRequest {
  keys: string[];
}

export interface ConfirmUploadItem {
  key: string;
  exists: boolean;
  size?: number;
}

export interface ConfirmUploadResponse {
  files: ConfirmUploadItem[];
}
