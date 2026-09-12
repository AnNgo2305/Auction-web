import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { UPDATE_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { UpdateAuctionBody } from '@/features/auction/schemas/update-auction.schema';
import type { UpdateAuctionResponse } from '@/features/auction/types/update-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useUpdateAuction(
  auctionId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAuctionResponse,
    ApiResponseError,
    UpdateAuctionBody
  >({
    mutationFn: async (
      body: UpdateAuctionBody,
    ): Promise<UpdateAuctionResponse> => {
      return await auctionApi.updateAuction(auctionId, body);
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
        (code && UPDATE_AUCTION_ERROR_MESSAGES[code]) ??
        UPDATE_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
