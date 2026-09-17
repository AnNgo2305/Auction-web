import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { watchlistApi } from '@/features/watchlist/api/watchlist.api.ts';
import { watchlistKeys } from '@/features/watchlist/constants/watchlist-query-key.ts';
import { REMOVE_FROM_WATCHLIST_ERROR_MESSAGES } from '@/features/watchlist/constants/watchlist-error.messages.ts';
import type { RemoveFromWatchlistResponse } from '@/features/watchlist/types/remove-from-watchlist.response.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';

export function useRemoveFromWatchlist(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<RemoveFromWatchlistResponse, ApiResponseError, string>({
    mutationFn: async (
      auctionId: string,
    ): Promise<RemoveFromWatchlistResponse> => {
      return await watchlistApi.removeFromWatchlist(auctionId);
    },

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: watchlistKeys.myList(),
        }),
      ]);

      toast.success(response.message);
      onSuccess?.();
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && REMOVE_FROM_WATCHLIST_ERROR_MESSAGES[code]) ??
        REMOVE_FROM_WATCHLIST_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
