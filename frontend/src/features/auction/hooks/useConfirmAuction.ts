import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { CONFIRM_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { ConfirmAuctionResponse } from '@/features/auction/types/confirm-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useConfirmAuction(
  auctionId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<ConfirmAuctionResponse, ApiResponseError, void>({
    mutationFn: async (): Promise<ConfirmAuctionResponse> => {
      return await auctionApi.confirmAuction(auctionId);
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
        (code && CONFIRM_AUCTION_ERROR_MESSAGES[code]) ??
        CONFIRM_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
