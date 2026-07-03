export type UploadPurpose = 'avatar' | 'cover';

export type ObjectAcl = 'public-read' | 'private';

export interface FileMetadata {
  mimeType: string;
  size: number;
  originalFileName: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
}
