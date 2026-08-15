import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '@/features/chat/api/chat.api';
import { messageKeys } from '@/features/chat/constants/message-query-key.ts';

const DEFAULT_LIMIT = 20;

export function useGetMessages(
  conversationId: string,
  limit: number = DEFAULT_LIMIT,
) {
  return useInfiniteQuery({
    queryKey: messageKeys.list(conversationId),

    queryFn: async ({ pageParam }) => {
      return await chatApi.getMessages(conversationId, limit, pageParam);
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,

    enabled: !!conversationId,

    select: ({ pages }) => ({
      messages: pages.flatMap((page) => page.data.messages),
    }),
  });
}
