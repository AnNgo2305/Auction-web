import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { ACCEPT_FOLLOW_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { AcceptFollowResponse } from '@/features/profile/types/relationship/accept-follow.response';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship.ts';

type AcceptFollowVariables = {
  sellerId: string;
  bidderId: string;
};

type AcceptFollowContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useAcceptFollow() {
  const queryClient = useQueryClient();

  return useMutation<
    AcceptFollowResponse,
    ApiResponseError,
    AcceptFollowVariables,
    AcceptFollowContext
  >({
    mutationFn: async ({ bidderId }): Promise<AcceptFollowResponse> => {
      return await relationApi.acceptFollow(bidderId);
    },

    onMutate: async ({ bidderId }): Promise<AcceptFollowContext> => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail(bidderId),
      });

      const previousProfileCache = queryClient.getQueryData<GetProfileResponse>(
        profileKeys.detail(bidderId),
      );

      queryClient.setQueryData<GetProfileResponse>(
        profileKeys.detail(bidderId),
        (previousGetProfileResponse) => {
          if (!previousGetProfileResponse) {
            return previousGetProfileResponse;
          }

          return {
            ...previousGetProfileResponse,
            data: {
              ...previousGetProfileResponse.data,
              relationship: {
                status: RELATIONSHIP_STATUSES.ACCEPTED,
              },
            },
          };
        },
      );

      return { previousProfileCache };
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
        (code && ACCEPT_FOLLOW_ERROR_MESSAGES[code]) ??
        ACCEPT_FOLLOW_ERROR_MESSAGES.DEFAULT;

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

      // Refresh the current bidder's followings list (source = Bidder Main Profile page).
      await queryClient.invalidateQueries({
        queryKey: relationKeys.followings(variables.bidderId),
      });

      // Refresh the current seller's followers list (source = Seller Follower page).
      await queryClient.invalidateQueries({
        queryKey: relationKeys.followers(variables.sellerId),
      });
    }
  });
}
