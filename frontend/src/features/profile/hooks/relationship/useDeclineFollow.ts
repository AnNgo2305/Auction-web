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

type CancelFollowVariables = {
  sellerId: string;
  bidderId: string;
};

type DeclineFollowContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useDeclineFollow() {
  const queryClient = useQueryClient();

  return useMutation<
    DeclineFollowResponse,
    ApiResponseError,
    CancelFollowVariables,
    DeclineFollowContext
  >({
    mutationFn: async ({ bidderId }): Promise<DeclineFollowResponse> => {
      return await relationApi.declineFollow(bidderId);
    },

    onMutate: async ({ bidderId }): Promise<DeclineFollowContext> => {
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

    onError: (error, variables, context) => {
      if (context?.previousProfileCache) {
        queryClient.setQueryData(
          profileKeys.detail(variables.bidderId),
          context.previousProfileCache,
        );
      }

      const code = error.errorCode;

      const message =
        (code && DECLINE_FOLLOW_ERROR_MESSAGES[code]) ??
        DECLINE_FOLLOW_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async (_, __, variables) => {
      // Refresh your pending follow requests list.
      await queryClient.invalidateQueries({
        queryKey: relationKeys.pendingRequests(),
      });

      // Refresh the current bidder's profile to reflect the latest relationship status (source = Bidder Main Profile page).
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.bidderId),
      });

      // Refresh the current seller's followers list (source = Seller Follower page).
      await queryClient.invalidateQueries({
        queryKey: relationKeys.followers(variables.sellerId),
      });
    }
  });
}
