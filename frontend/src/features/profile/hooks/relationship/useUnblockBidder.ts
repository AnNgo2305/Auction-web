import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { UNBLOCK_BIDDER_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { UnblockBidderResponse } from '@/features/profile/types/relationship/unblock-bidder.response';
import { RELATIONSHIP_STATUSES } from '@/shared/types/relationship.ts';

type UnblockBidderVariables = {
  sellerId: string;
  bidderId: string;
};

type UnblockBidderContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useUnblockBidder() {
  const queryClient = useQueryClient();

  return useMutation<
    UnblockBidderResponse,
    ApiResponseError,
    UnblockBidderVariables,
    UnblockBidderContext
  >({
    mutationFn: async ({ bidderId }): Promise<UnblockBidderResponse> => {
      return relationApi.unblockBidder(bidderId);
    },

    onMutate: async ({ bidderId }): Promise<UnblockBidderContext> => {
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
                status: RELATIONSHIP_STATUSES.NONE,
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
        (code && UNBLOCK_BIDDER_ERROR_MESSAGES[code]) ??
        UNBLOCK_BIDDER_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async (_, __, variables) => {
      // Refresh your blocked users list.
      await queryClient.invalidateQueries({
        queryKey: relationKeys.blockedUsers(),
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
