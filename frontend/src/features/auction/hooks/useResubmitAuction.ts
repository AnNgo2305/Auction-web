import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { RESUBMIT_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { ResubmitAuctionResponse } from '@/features/auction/types/resubmit-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useResubmitAuction(
  auctionId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<ResubmitAuctionResponse, ApiResponseError, void>({
    mutationFn: async (): Promise<ResubmitAuctionResponse> => {
      return await auctionApi.resubmitAuction(auctionId);
    },

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: auctionKeys.myLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: auctionKeys.detail(auctionId),
        }),
      ]);

      toast.success(response.message);
      onSuccessCallback?.();
    },

    onError: (error) => {
      const code = error?.errorCode;

      const message =
        (code && RESUBMIT_AUCTION_ERROR_MESSAGES[code]) ??
        RESUBMIT_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
