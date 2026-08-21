import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { conversationKeys } from '@/features/chat/constants/conversation-query-key.ts';
import { chatApi } from '@/features/chat/api/chat.api.ts';

const DEBOUNCE_MS = 250;
const DEFAULT_LIMIT = 10;

function useDebouncedValue<T>(value: T, delay = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

export function useSearchConversations(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase());

  const queryResult = useInfiniteQuery({
    queryKey: conversationKeys.search(debouncedQuery.toLowerCase()),

    queryFn: async ({ pageParam }) => {
      return await chatApi.searchConversations({
        query: debouncedQuery,
        limit: DEFAULT_LIMIT,
        cursor: pageParam,
      });
    },

    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,

    enabled: debouncedQuery.length > 0,

    staleTime: 1000 * 30,

    select: ({ pages }) => ({
      conversations: pages.flatMap((page) => page.data.conversations),
    }),
  });

  return {
    ...queryResult,
    query: debouncedQuery,
    conversations: queryResult.data?.conversations ?? [],
  };
}
