import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '@/features/profile/api/profile.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { UPDATE_PROFILE_IMAGE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { UpdateImageBody } from '@/features/profile/schemas/update-image.schema';
import type { UpdateProfileImageResponse } from '@/features/profile/types/update-profile-image.response';

export function useUpdateProfileImage(
  userId: string,
  onSuccessCallback?: (res: UpdateProfileImageResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfileImageResponse,
    ApiResponseError,
    UpdateImageBody
  >({
    mutationFn: profileApi.updateAvatar,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId),
      });

      onSuccessCallback?.(response);
    },

    onError: (err) => {
      const code = err.errorCode;

      const message =
        (code && UPDATE_PROFILE_IMAGE_ERROR_MESSAGES[code]) ??
        UPDATE_PROFILE_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
