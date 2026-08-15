import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '@/features/chat/api/chat.api';
import { conversationKeys } from '@/features/chat/constants/conversation-query-key';

const DEFAULT_LIMIT = 10;

export function useGetConversations(limit: number = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: conversationKeys.list(),

    queryFn: async ({ pageParam }) => {
      return await chatApi.getUserConversations(limit, pageParam);
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,

    staleTime: 1000 * 30,

    select: ({ pages }) => ({
      conversations: pages.flatMap((page) => page.data.conversations),
    }),
  });
}
