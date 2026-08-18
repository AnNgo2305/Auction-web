import { useEffect, useMemo, useState } from 'react';
import { useGetConversations } from '@/features/chat/hooks/conversation/useGetConversations';
import type { ConversationItem } from '@/features/chat/types/conversation/conversation-list.response';

const DEBOUNCE_MS = 250;

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

  const { data, isLoading } = useGetConversations();

  const conversations: ConversationItem[] = data?.conversations ?? [];

  const enabled = debouncedQuery.length > 0;

  const matches = useMemo(() => {
    if (!enabled) return [];

    return conversations.filter((conversation) => {
      const username = conversation.otherUser.username.toLowerCase();

      return username.includes(debouncedQuery);
    });
  }, [conversations, debouncedQuery, enabled]);

  return {
    query: debouncedQuery,
    matches,
    isLoading: enabled && isLoading,
  };
}
