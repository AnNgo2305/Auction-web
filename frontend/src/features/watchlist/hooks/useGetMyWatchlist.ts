import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { watchlistApi } from '@/features/watchlist/api/watchlist.api.ts';
import { watchlistKeys } from '@/features/watchlist/constants/watchlist-query-key.ts';
import type { GetMyWatchlistResponse } from '@/features/watchlist/types/get-my-watchlist.response.ts';
import { ApiError } from '@/shared/api/api-error.ts';

export function useGetMyWatchlist() {
  return useInfiniteQuery<
    GetMyWatchlistResponse,
    ApiError,
    InfiniteData<GetMyWatchlistResponse, string | undefined>,
    ReturnType<typeof watchlistKeys.myList>,
    string | undefined
  >({
    queryKey: watchlistKeys.myList(),
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    queryFn: async ({ pageParam }): Promise<GetMyWatchlistResponse> => {
      return await watchlistApi.getMyWatchlist({
        limit: 10,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data.nextCursor ?? undefined;
    },
  });
}
