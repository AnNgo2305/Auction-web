import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '@/features/profile/api/profile.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { DELETE_PROFILE_IMAGE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { DeleteProfileImageResponse } from '@/features/profile/types/profile/delete-profile-image.response.ts';

export function useDeleteProfileImage(
  userId: string,
  onSuccessCallback?: (res: DeleteProfileImageResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<DeleteProfileImageResponse, ApiResponseError, void>({
    mutationFn: async (): Promise<DeleteProfileImageResponse> => {
      return await profileApi.deleteAvatarImage();
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId),
      });

      onSuccessCallback?.(response);
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && DELETE_PROFILE_IMAGE_ERROR_MESSAGES[code]) ??
        DELETE_PROFILE_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
