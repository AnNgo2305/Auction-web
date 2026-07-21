export enum UPLOAD_PURPOSE {
  AVATAR = 'avatar',
  COVER = 'cover',
  PRODUCT_IMAGE = 'productImage',
  PRODUCT_DOCUMENT = 'productDocument',
}

export type UploadPurpose =
  | UPLOAD_PURPOSE.AVATAR
  | UPLOAD_PURPOSE.COVER
  | UPLOAD_PURPOSE.PRODUCT_IMAGE
  | UPLOAD_PURPOSE.PRODUCT_DOCUMENT;

export enum IMAGE_MIME_TYPE {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export type ImageMimeType =
  | IMAGE_MIME_TYPE.JPEG
  | IMAGE_MIME_TYPE.JPG
  | IMAGE_MIME_TYPE.PNG
  | IMAGE_MIME_TYPE.WEBP;

export enum DOCUMENT_MIME_TYPE {
  PDF = 'application/pdf',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT = 'text/plain',
  CSV = 'text/csv',
}

export type DocumentMimeType =
  | DOCUMENT_MIME_TYPE.PDF
  | DOCUMENT_MIME_TYPE.DOC
  | DOCUMENT_MIME_TYPE.DOCX
  | DOCUMENT_MIME_TYPE.XLS
  | DOCUMENT_MIME_TYPE.XLSX
  | DOCUMENT_MIME_TYPE.PPT
  | DOCUMENT_MIME_TYPE.PPTX
  | DOCUMENT_MIME_TYPE.TXT
  | DOCUMENT_MIME_TYPE.CSV;


export interface FileMetadata {
  mimeType: string;
  size: number;
  originalFileName: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
}
