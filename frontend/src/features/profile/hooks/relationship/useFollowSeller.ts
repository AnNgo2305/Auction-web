import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FollowSellerResponse } from '@/features/profile/types/relationship/follow-seller.response';
import type { ApiResponseError } from '@/shared/types/error';
import { relationApi } from '@/features/profile/api/relation.api';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { toast } from 'sonner';
import { FOLLOW_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';

type FollowSellerContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useFollowSeller(sellerId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    FollowSellerResponse,
    ApiResponseError,
    void,
    FollowSellerContext
  >({
    mutationFn: async (): Promise<FollowSellerResponse> => {
      return relationApi.followSeller(sellerId);
    },

    onMutate: async (): Promise<FollowSellerContext> => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail(sellerId),
      });

      const previousProfileCache = queryClient.getQueryData<GetProfileResponse>(
        profileKeys.detail(sellerId),
      );

      queryClient.setQueryData<GetProfileResponse>(
        profileKeys.detail(sellerId),
        (previousGetProfileResponse) => {
          if (!previousGetProfileResponse) return previousGetProfileResponse;
          return {
            ...previousGetProfileResponse,
            data: {
              ...previousGetProfileResponse.data,
              relationship: {
                status: RelationshipStatus.PENDING_OUTGOING,
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
        (code && FOLLOW_ERROR_MESSAGES[code]) ?? FOLLOW_ERROR_MESSAGES.DEFAULT;
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