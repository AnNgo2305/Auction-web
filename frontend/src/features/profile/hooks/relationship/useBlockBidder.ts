import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { relationApi } from '@/features/profile/api/relation.api';
import { profileKeys } from '@/features/profile/constants/profile-query-key';
import { relationKeys } from '@/features/profile/constants/relation-query-key';
import { BLOCK_BIDDER_ERROR_MESSAGES } from '@/features/profile/constants/relationship-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { GetProfileResponse } from '@/features/profile/types/profile/get-profile.response';
import type { BlockBidderResponse } from '@/features/profile/types/relationship/block-bidder.response';

import { RelationshipStatus } from '@/features/profile/types/profile/relationship.type';

type BlockBidderContext = {
  previousProfileCache?: GetProfileResponse;
};

export function useBlockBidder(bidderId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    BlockBidderResponse,
    ApiResponseError,
    void,
    BlockBidderContext
  >({
    mutationFn: async (): Promise<BlockBidderResponse> => {
      return relationApi.blockBidder(bidderId);
    },

    onMutate: async (): Promise<BlockBidderContext> => {
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
                status: RelationshipStatus.BLOCKING,
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
        (code && BLOCK_BIDDER_ERROR_MESSAGES[code]) ??
        BLOCK_BIDDER_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.detail(bidderId),
      });

      await queryClient.invalidateQueries({
        queryKey: relationKeys.blockedUsers(),
      });
    },
  });
}
