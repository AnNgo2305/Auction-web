import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { CANCEL_FOLLOW_REQUEST_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { CancelFollowRequestResponse } from '@/features/profile/types/relationship/cancel-follow-request.response';

import { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';

type CancelFollowRequestContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useCancelFollowRequest(sellerId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    CancelFollowRequestResponse,
    ApiResponseError,
    void,
    CancelFollowRequestContext
  >({
    mutationFn: async (): Promise<CancelFollowRequestResponse> => {
      return relationApi.cancelFollowRequest(sellerId);
    },

    onMutate: async (): Promise<CancelFollowRequestContext> => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail(sellerId),
      });

      const previousProfileCache = queryClient.getQueryData<GetProfileResponse>(
        profileKeys.detail(sellerId),
      );

      queryClient.setQueryData<GetProfileResponse>(
        profileKeys.detail(sellerId),
        (previousGetProfileResponse) => {
          if (!previousGetProfileResponse) {
            return previousGetProfileResponse;
          }

          return {
            ...previousGetProfileResponse,
            data: {
              ...previousGetProfileResponse.data,
              relationship: {
                status: RelationshipStatus.NONE,
              },
            },
          };
        },
      );

      return {
        previousProfileCache,
      };
    },

    onSuccess: (response) => {
      toast.success(response.message);
    },

    onError: (error, _, context) => {
      if (context?.previousProfileCache) {
        queryClient.setQueryData(
          profileKeys.detail(sellerId),
          context.previousProfileCache,
        );
      }

      const code = error.errorCode;
      const message =
        (code && CANCEL_FOLLOW_REQUEST_ERROR_MESSAGES[code]) ??
        CANCEL_FOLLOW_REQUEST_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(sellerId),
      });

      await queryClient.invalidateQueries({
        queryKey: relationKeys.sentRequests(),
      });
    },
  });
}
