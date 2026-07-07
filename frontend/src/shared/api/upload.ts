import { api } from './axios';
import type { ApiResponse } from '@/shared/types/response';
import type {
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  CreatePresignedUrlsRequest,
  CreatePresignedUrlsResponse,
} from '@/shared/types/upload';

const UPLOAD_API_PREFIX = '/upload';

export async function createPresignedUrls(
  payload: CreatePresignedUrlsRequest,
): Promise<ApiResponse<CreatePresignedUrlsResponse>> {
  const response = await api.post<ApiResponse<CreatePresignedUrlsResponse>>(
    `${UPLOAD_API_PREFIX}/presigned-urls`,
    payload,
  );

  return response.data;
}

export async function uploadFile(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  await api.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    },
  });
}

export async function confirmUpload(
  payload: ConfirmUploadRequest,
): Promise<ApiResponse<ConfirmUploadResponse>> {
  const response = await api.post<ApiResponse<ConfirmUploadResponse>>(
    `${UPLOAD_API_PREFIX}/confirm`,
    payload,
  );

  return response.data;
}
