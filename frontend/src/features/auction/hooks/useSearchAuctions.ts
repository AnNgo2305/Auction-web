import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import type { SearchAuctionsQuery } from '@/features/auction/schemas/search-auctions.schema';
import type { SearchAuctionsResponse } from '@/features/auction/types/search-auctions.response';
import { ApiError } from '@/shared/api/api-error';

export function useSearchAuctions(query: SearchAuctionsQuery) {
  return useInfiniteQuery<
    SearchAuctionsResponse,
    ApiError,
    InfiniteData<SearchAuctionsResponse, string | undefined>,
    ReturnType<typeof auctionKeys.list>,
    string | undefined
  >({
    queryKey: auctionKeys.list(query),
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    queryFn: async ({ pageParam }): Promise<SearchAuctionsResponse> => {
      return await auctionApi.searchAuctions({
        ...query,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data.meta.hasNextPage
        ? lastPage.data.meta.nextCursor
        : undefined;
    },
  });
}
