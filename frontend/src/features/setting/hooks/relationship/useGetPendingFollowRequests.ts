import { useInfiniteQuery } from '@tanstack/react-query';
import { relationApi } from '@/features/profile/api/relation.api';
import { relationKeys } from '@/features/profile/constants/relation-query-key';

const DEFAULT_LIMIT = 10;

export function useGetPendingFollowRequests(limit: number = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: relationKeys.pendingRequests(),
    queryFn: async ({ pageParam }) => {
      return await relationApi.getPendingFollowRequests(limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    staleTime: 1000 * 30,
    select: ({ pages }) => ({
      pendingRequests: pages.flatMap(
        (page) => page.data.receivedFollowRequests,
      ),
    }),
  });
}
