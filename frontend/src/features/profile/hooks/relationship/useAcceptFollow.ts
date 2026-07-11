import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { ACCEPT_FOLLOW_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { AcceptFollowResponse } from '@/features/profile/types/relationship/accept-follow.response';
import { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';

type AcceptFollowContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useAcceptFollow(sellerId: string, bidderId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    AcceptFollowResponse,
    ApiResponseError,
    void,
    AcceptFollowContext
  >({
    mutationFn: async (): Promise<AcceptFollowResponse> => {
      return await relationApi.acceptFollow(bidderId);
    },

    onMutate: async (): Promise<AcceptFollowContext> => {
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
                status: RelationshipStatus.ACCEPTED,
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
          profileKeys.detail(bidderId),
          context.previousProfileCache,
        );
      }

      const code = error.errorCode;

      const message =
        (code && ACCEPT_FOLLOW_ERROR_MESSAGES[code]) ??
        ACCEPT_FOLLOW_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(bidderId),
      });

      await queryClient.invalidateQueries({
        queryKey: relationKeys.pendingRequests(),
      });

      await queryClient.invalidateQueries({
        queryKey: relationKeys.followers(sellerId),
      });

      await queryClient.invalidateQueries({
        queryKey: relationKeys.followings(bidderId),
      });
    },
  });
}
