import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { auctionApi } from '@/features/auction/api/auction.api';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import type { GetMyAuctionsQuery } from '@/features/auction/schemas/get-my-auctions.schema';
import type { GetMyAuctionsResponse } from '@/features/auction/types/get-my-auctions.response';
import { ApiError } from '@/shared/api/api-error';

export function useGetMyAuctions(query: GetMyAuctionsQuery) {
  return useInfiniteQuery<
    GetMyAuctionsResponse,
    ApiError,
    InfiniteData<GetMyAuctionsResponse, string | undefined>,
    ReturnType<typeof auctionKeys.myList>,
    string | undefined
  >({
    queryKey: auctionKeys.myList(query),
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    queryFn: async ({ pageParam }): Promise<GetMyAuctionsResponse> => {
      return await auctionApi.getMyAuctions({
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
