import { useInfiniteQuery } from '@tanstack/react-query';
import { relationApi } from '@/features/profile/api/relation.api';
import { relationKeys } from '@/features/profile/constants/relation-query-key';

const DEFAULT_LIMIT = 20;

export function useGetFollowers(
  sellerId: string,
  limit: number = DEFAULT_LIMIT,
) {
  return useInfiniteQuery({
    queryKey: relationKeys.followers(sellerId),
    queryFn: async ({ pageParam }) => {
      return await relationApi.getFollowers(sellerId, limit, pageParam)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: !!sellerId,
    staleTime: 1000 * 30,
    select: ({pages}) => ({
      bidders: pages.flatMap((page) => page.data.bidders),
    })
  });
}
