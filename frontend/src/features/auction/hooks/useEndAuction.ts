import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { END_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { EndAuctionResponse } from '@/features/auction/types/end-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useEndAuction(
  auctionId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<EndAuctionResponse, ApiResponseError, void>({
    mutationFn: async (): Promise<EndAuctionResponse> => {
      return await auctionApi.endAuction(auctionId);
    },

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: auctionKeys.myLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: auctionKeys.detail(auctionId),
        }),
        queryClient.invalidateQueries({
          queryKey: auctionKeys.lists(),
        }),
      ]);

      toast.success(response.message);
      onSuccessCallback?.();
    },

    onError: (error) => {
      const code = error?.errorCode;

      const message =
        (code && END_AUCTION_ERROR_MESSAGES[code]) ??
        END_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
