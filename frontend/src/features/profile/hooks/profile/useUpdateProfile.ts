import type { UpdateProfileResponse } from '@/features/profile/types/update-profile.response';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/features/profile/api/profile.api.ts';
import { profileKeys } from '@/features/profile/constants/profile-query-key.ts';
import { type GetProfileResponse } from '@/features/profile/types/get-profile.response.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';
import type { UpdateProfileBody } from '@/features/profile/schemas/update-profile.schema';
import { UPDATE_PROFILE_ERROR_MESSAGES } from '@/features/profile/constants/profile-error.messages.ts';
import { toast } from 'sonner';

type UpdateProfileContext = {
  previousGetProfileResponseCache?: GetProfileResponse;
};

export function useUpdateProfile(
  userId: string,
  onSuccessCallback?: (res: UpdateProfileResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProfileResponse,
    ApiResponseError,
    UpdateProfileBody,
    UpdateProfileContext
  >({
    mutationFn: profileApi.updateProfile,

    onMutate: async (
      updateProfileBody: UpdateProfileBody,
    ): Promise<UpdateProfileContext> => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail(userId),
      });

      const previousGetProfileResponseCache =
        queryClient.getQueryData<GetProfileResponse>(
          profileKeys.detail(userId),
        );

      queryClient.setQueryData<GetProfileResponse>(
        profileKeys.detail(userId),
        (previousGetProfileResponse) => {
          if (!previousGetProfileResponse) return previousGetProfileResponse;
          return {
            ...previousGetProfileResponse,
            data: {
              ...previousGetProfileResponse.data,

              ...(updateProfileBody.fullName !== undefined && {
                fullName: updateProfileBody.fullName,
              }),

              ...(updateProfileBody.phoneNumber !== undefined && {
                phoneNumber: updateProfileBody.phoneNumber,
              }),

              ...(updateProfileBody.bio !== undefined && {
                bio: updateProfileBody.bio,
              }),

              ...(updateProfileBody.dateOfBirth !== undefined && {
                dateOfBirth: updateProfileBody.dateOfBirth,
              }),

              ...(updateProfileBody.gender !== undefined && {
                gender: updateProfileBody.gender,
              }),
            },
          };
        },
      );

      return { previousGetProfileResponseCache };
    },

    onSuccess: async (response) => {
      onSuccessCallback?.(response);
    },

    onError: (error, _updateProfileBody, context) => {
      if (context?.previousGetProfileResponseCache) {
        queryClient.setQueryData(
          profileKeys.detail(userId),
          context.previousGetProfileResponseCache,
        );
      }

      const code = error?.errorCode;
      const message =
        (code && UPDATE_PROFILE_ERROR_MESSAGES[code]) ??
        UPDATE_PROFILE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId),
      });
    },
  });
}