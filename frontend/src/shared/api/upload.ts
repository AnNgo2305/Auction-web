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
): Promise<void> {
  await api.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
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
