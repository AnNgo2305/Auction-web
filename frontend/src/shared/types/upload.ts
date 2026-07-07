export type UploadPurpose = 'avatar' | 'cover';

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
