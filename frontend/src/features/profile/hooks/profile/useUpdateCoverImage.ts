import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '@/features/profile/api/profile.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { UPDATE_COVER_IMAGE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { UpdateImageBody } from '@/features/profile/schemas/update-image.schema';
import type { UpdateCoverImageResponse } from '@/features/profile/types/profile/update-cover-image.response.ts';

export function useUpdateCoverImage(
  userId: string,
  onSuccessCallback?: (res: UpdateCoverImageResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateCoverImageResponse,
    ApiResponseError,
    UpdateImageBody
  >({
    mutationFn: async (body: UpdateImageBody): Promise<UpdateCoverImageResponse> => {
      return await profileApi.updateCover(body);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId),
      });

      onSuccessCallback?.(response);
    },

    onError: (err) => {
      const code = err.errorCode;

      const message =
        (code && UPDATE_COVER_IMAGE_ERROR_MESSAGES[code]) ??
        UPDATE_COVER_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
