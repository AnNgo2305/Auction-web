import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { watchlistApi } from '@/features/watchlist/api/watchlist.api.ts';
import { watchlistKeys } from '@/features/watchlist/constants/watchlist-query-key.ts';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { ADD_TO_WATCHLIST_ERROR_MESSAGES } from '@/features/watchlist/constants/watchlist-error.messages.ts';
import type { AddToWatchlistResponse } from '@/features/watchlist/types/add-to-watchlist.response.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';

export function useAddToWatchlist(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<AddToWatchlistResponse, ApiResponseError, string>({
    mutationFn: async (auctionId: string): Promise<AddToWatchlistResponse> => {
      return await watchlistApi.addToWatchlist(auctionId);
    },

    onSuccess: async (response, auctionId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.myList(),
        }),
        queryClient.invalidateQueries({
          queryKey: auctionKeys.detail(auctionId),
        }),
      ]);

      toast.success(response.message);
      onSuccess?.();
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && ADD_TO_WATCHLIST_ERROR_MESSAGES[code]) ??
        ADD_TO_WATCHLIST_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
