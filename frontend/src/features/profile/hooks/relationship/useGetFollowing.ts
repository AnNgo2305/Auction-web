import { useInfiniteQuery } from '@tanstack/react-query';
import { relationApi } from '@/features/profile/api/relation.api';
import { relationKeys } from '@/features/profile/constants/relation-query-key';

const DEFAULT_LIMIT = 20;

export function useGetFollowing(
  bidderId: string,
  limit: number = DEFAULT_LIMIT,
) {
  return useInfiniteQuery({
    queryKey: relationKeys.followings(bidderId),
    queryFn: async ({ pageParam }) => {
      return await relationApi.getFollowings(bidderId, limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: !!bidderId,
    staleTime: 1000 * 30,
    select: ({ pages }) => ({
      sellers: pages.flatMap((page) => page.data.sellers),
    }),
  });
}
