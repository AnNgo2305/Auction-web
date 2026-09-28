import { useInfiniteQuery } from '@tanstack/react-query';
import { bidApi } from '@/features/bid/api/bid.api';
import { bidKeys } from '@/features/bid/constants/bid-query-key';

const DEFAULT_LIMIT = 10;

export function useGetAuctionBids(
  auctionId: string,
  limit: number = DEFAULT_LIMIT,
) {
  return useInfiniteQuery({
    queryKey: bidKeys.auction(auctionId),
    queryFn: async ({ pageParam }) => {
      return await bidApi.getBidsByAuction(auctionId, limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: !!auctionId,
    staleTime: 1000 * 30,
  });
}
