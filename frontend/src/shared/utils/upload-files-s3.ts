import {
  confirmUpload,
  createPresignedUrls,
  uploadFile,
} from '@/shared/api/upload';
import type { ConfirmUploadItem, UploadPurpose } from '@/shared/types/upload';

export async function uploadToS3(
  files: File[],
  purpose: UploadPurpose,
  onProgress?: (fileIndex: number, percent: number) => void,
): Promise<ConfirmUploadItem[]> {
  // Request presigned URLs from the backend
  const { data } = await createPresignedUrls({
    purpose,
    files: files.map((file) => ({
      originalFileName: file.name,
      mimeType: file.type,
      size: file.size,
    })),
  });

  // Upload files directly to Amazon S3
  await Promise.all(
    data.urls.map((url, index) => {
      const file = files[index];
      if (!file) {
        throw new Error(`Missing file at index ${index}`);
      }
      return uploadFile(url.uploadUrl, file, (percent) =>
        onProgress?.(index, percent),
      );
    })
  );

  // Confirm uploaded files with the backend
  const confirmResponse = await confirmUpload({
    keys: data.urls.map((url) => url.key),
  });

  return confirmResponse.data.files;
}
