import { profileApi } from '@/features/profile/api/profile.api.ts';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiResponseError } from '@/shared/types/error.ts';
import { DELETE_COVER_IMAGE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages.ts';
import type { DeleteCoverImageResponse } from '@/features/profile/types/delete-cover-image.response.ts';

export function useDeleteCoverImage() {
  return useMutation<DeleteCoverImageResponse, ApiResponseError, void>({
    mutationFn: profileApi.deleteCoverImage,

    onError: (err: ApiResponseError) => {
      const code = err?.errorCode;

      const message =
        (code && DELETE_COVER_IMAGE_ERROR_MESSAGES[code]) ??
        DELETE_COVER_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}