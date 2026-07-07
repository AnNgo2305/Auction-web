import { useMutation } from '@tanstack/react-query';
import type { UpdateProfileResponse } from '@/features/profile/types/update-profile.response';
import type { ApiResponseError } from '@/shared/types/error';
import type { UpdateProfileBody } from '@/features/profile/schemas/update-profile.schema';
import { profileApi } from '@/features/profile/api/profile.api.ts';
import { toast } from 'sonner';
import { UPDATE_PROFILE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages';

export function useUpdateProfile(
  onSuccessCallback?: (res: UpdateProfileResponse) => void,
) {
  return useMutation<
    UpdateProfileResponse,
    ApiResponseError,
    UpdateProfileBody
  >({
    mutationFn: profileApi.updateProfile,

    onSuccess: (res: UpdateProfileResponse) => {
      toast.success(res.message || 'Profile updated successfully');
      onSuccessCallback?.(res);
    },

    onError: (err: ApiResponseError) => {
      const code = err?.errorCode;

      const message =
        (code && UPDATE_PROFILE_ERROR_MESSAGES[code]) ??
        UPDATE_PROFILE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
