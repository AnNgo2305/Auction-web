import { profileApi } from '@/features/profile/api/profile.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiResponseError } from '@/shared/types/error';
import { DELETE_COVER_IMAGE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages';
import type { DeleteCoverImageResponse } from '@/features/profile/types/profile/delete-cover-image.response.ts';
import { profileKeys } from '@/features/profile/constants/profile-query-key';

export function useDeleteCoverImage(
  userId: string,
  onSuccessCallback?: (res: DeleteCoverImageResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<DeleteCoverImageResponse, ApiResponseError, void>({
    mutationFn: async (): Promise<DeleteCoverImageResponse> => {
      return await profileApi.deleteCoverImage();
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId),
      });

      onSuccessCallback?.(response);
    },

    onError: (err: ApiResponseError) => {
      const code = err?.errorCode;

      const message =
        (code && DELETE_COVER_IMAGE_ERROR_MESSAGES[code]) ??
        DELETE_COVER_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}