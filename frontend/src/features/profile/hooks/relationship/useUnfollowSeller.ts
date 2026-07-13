import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { UNFOLLOW_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { UnfollowSellerResponse } from '@/features/profile/types/relationship/unfollow-seller.response';
import { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';

type UnfollowSellerVariables = {
  sellerId: string;
  bidderId: string;
};

type UnfollowSellerContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useUnfollowSeller() {
  const queryClient = useQueryClient();

  return useMutation<
    UnfollowSellerResponse,
    ApiResponseError,
    UnfollowSellerVariables,
    UnfollowSellerContext
  >({
    mutationFn: async ({sellerId}): Promise<UnfollowSellerResponse> => {
      return relationApi.unfollowSeller(sellerId);
    },

    onMutate: async ({sellerId}): Promise<UnfollowSellerContext> => {
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

    onError: (error, variables, context) => {
      if (context?.previousProfileCache) {
        queryClient.setQueryData(
          profileKeys.detail(variables.sellerId),
          context.previousProfileCache,
        );
      }
      const code = error.errorCode;
      const message =
        (code && UNFOLLOW_ERROR_MESSAGES[code]) ??
        UNFOLLOW_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async (_, __, variables) => {
      // Refresh the current seller's profile to reflect the latest relationship status (source = Seller Main Profile page)
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.sellerId),
      });

      // Refresh the current seller's follower list (source = Seller Main Profile page).
      await queryClient.invalidateQueries({
        queryKey: relationKeys.followers(variables.sellerId),
      });

      // Refresh the current bidder's following list (source = Bidder Following page).
      await queryClient.invalidateQueries({
        queryKey: relationKeys.followings(variables.bidderId),
      });
    },
  });
}
