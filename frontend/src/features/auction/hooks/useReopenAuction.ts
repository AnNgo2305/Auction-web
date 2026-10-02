import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { auctionApi } from '@/features/auction/api/auction.api';
import type { ApiResponseError } from '@/shared/types/error';
import type { ReopenAuctionResponse } from '@/features/auction/types/reopen-auction.response.ts';
import { REOPEN_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';

export function useReopenAuction(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<ReopenAuctionResponse, ApiResponseError, string>({
    mutationFn: async (auctionId: string): Promise<ReopenAuctionResponse> => {
      return await auctionApi.reopenAuction(auctionId);
    },

    onSuccess: async (response, auctionId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionKeys.myLists() }),
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
        (code && REOPEN_AUCTION_ERROR_MESSAGES[code]) ??
        REOPEN_AUCTION_ERROR_MESSAGES.DEFAULT;
      toast.error(message);
    },
  });
}
