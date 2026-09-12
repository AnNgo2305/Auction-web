import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { CREATE_AUCTION_ERROR_MESSAGES } from '@/features/auction/constants/auction-error-messages';
import type { CreateAuctionBody } from '@/features/auction/schemas/create-auction.schema';
import type { CreateAuctionResponse } from '@/features/auction/types/create-auction.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useCreateAuction(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAuctionResponse,
    ApiResponseError,
    CreateAuctionBody
  >({
    mutationFn: async (
      body: CreateAuctionBody,
    ): Promise<CreateAuctionResponse> => {
      return await auctionApi.createAuction(body);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: auctionKeys.myLists(),
      });

      toast.success(response.message);
      onSuccessCallback?.();
    },

    onError: (error) => {
      const code = error?.errorCode;
      const message =
        (code && CREATE_AUCTION_ERROR_MESSAGES[code]) ??
        CREATE_AUCTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
