import { useInfiniteQuery } from '@tanstack/react-query';
import { bidApi } from '@/features/bid/api/bid.api';
import { bidKeys } from '@/features/bid/constants/bid-query-key';

const DEFAULT_LIMIT = 10;

export function useGetMyBids(limit: number = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: bidKeys.mine(),
    queryFn: async ({ pageParam }) => {
      return await bidApi.getMyBids(limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    staleTime: 1000 * 30,
    select: ({ pages }) => ({
      bids: pages.flatMap((page) => page.data.bids),
    }),
  });
}
