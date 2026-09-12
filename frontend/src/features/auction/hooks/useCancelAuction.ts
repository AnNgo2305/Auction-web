import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { CANCEL_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { CancelAuctionBody } from '@/features/auction/schemas/cancel-auction.schema';
import type { CancelAuctionResponse } from '@/features/auction/types/cancel-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useCancelAuction(
  auctionId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    CancelAuctionResponse,
    ApiResponseError,
    CancelAuctionBody
  >({
    mutationFn: async (
      body: CancelAuctionBody,
    ): Promise<CancelAuctionResponse> => {
      return await auctionApi.cancelAuction(auctionId, body);
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
        (code && CANCEL_AUCTION_ERROR_MESSAGES[code]) ??
        CANCEL_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
