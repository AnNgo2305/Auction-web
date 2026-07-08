import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi } from '@/features/profile/api/profile.api.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';
import type { DeleteProfileImageResponse } from '@/features/profile/types/delete-profile-image.response.ts';
import { DELETE_PROFILE_IMAGE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages.ts';

export function useDeleteProfileImage() {
  return useMutation<DeleteProfileImageResponse, ApiResponseError, void>({
    mutationFn: profileApi.deleteAvatarImage,

    onError: (err) => {
      const code = err.errorCode;

      const message =
        (code && DELETE_PROFILE_IMAGE_ERROR_MESSAGES[code]) ??
        DELETE_PROFILE_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
