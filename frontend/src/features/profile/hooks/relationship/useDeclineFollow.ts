import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { DECLINE_FOLLOW_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { DeclineFollowResponse } from '@/features/profile/types/relationship/decline-follow.response';

import { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';

type DeclineFollowContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useDeclineFollow(bidderId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    DeclineFollowResponse,
    ApiResponseError,
    void,
    DeclineFollowContext
  >({
    mutationFn: async (): Promise<DeclineFollowResponse> => {
      return await relationApi.declineFollow(bidderId);
    },

    onMutate: async (): Promise<DeclineFollowContext> => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail(bidderId),
      });

      const previousProfileCache = queryClient.getQueryData<GetProfileResponse>(
        profileKeys.detail(bidderId),
      );

      if (previousProfileCache) {
        queryClient.setQueryData<GetProfileResponse>(
          profileKeys.detail(bidderId),
          {
            ...previousProfileCache,
            data: {
              ...previousProfileCache.data,
              relationship: {
                status: RelationshipStatus.NONE,
              },
            },
          },
        );
      }

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
          profileKeys.detail(bidderId),
          context.previousProfileCache,
        );
      }

      const code = error.errorCode;

      const message =
        (code && DECLINE_FOLLOW_ERROR_MESSAGES[code]) ??
        DECLINE_FOLLOW_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(bidderId),
      });

      await queryClient.invalidateQueries({
        queryKey: relationKeys.pendingRequests(),
      });
    },
  });
}
