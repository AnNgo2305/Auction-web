import { useInfiniteQuery } from '@tanstack/react-query';
import { relationApi } from '@/features/profile/api/relation.api';
import { relationKeys } from '@/features/profile/constants/relation-query-key';

const DEFAULT_LIMIT = 10;

export function useGetBlockedUsers(limit: number = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: relationKeys.blockedUsers(),
    queryFn: async ({ pageParam }) => {
      return await relationApi.getBlockedUsers(limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    staleTime: 1000 * 30,
    select: ({ pages }) => ({
      blockedUsers: pages.flatMap((page) => page.data.blockedUsers),
    }),
  });
}
