export type UploadPurpose =
  | 'avatar'
  | 'cover'
  | 'productImage'
  | 'productDocument';

export interface FileMetadata {
  mimeType: string;
  size: number;
  originalFileName: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
}
