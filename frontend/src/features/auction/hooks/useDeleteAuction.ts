import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { DELETE_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { DeleteAuctionResponse } from '@/features/auction/types/delete-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteAuction(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<DeleteAuctionResponse, ApiResponseError, string>({
    mutationFn: async (auctionId: string): Promise<DeleteAuctionResponse> => {
      return await auctionApi.deleteAuction(auctionId);
    },

    onSuccess: async (response, auctionId) => {
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
        (code && DELETE_AUCTION_ERROR_MESSAGES[code]) ??
        DELETE_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
