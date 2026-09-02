import { Loader2, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group';
import { useGetConversations } from '@/features/chat/hooks/conversation/useGetConversations';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { useSearchConversations } from '@/features/chat/hooks/conversation/useSearchConversations.ts';
import { ConversationItem } from '@/features/chat/components/ConversationItem.tsx';
import { ConversationPreview } from '@/features/chat/components/ConversationPreview.tsx';
import { usePresenceStore } from '@/shared/stores/presence.store';

type Conversation = {
  conversationId: string;
  otherUser: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };
};

type ConversationListProps = {
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
};

function ConversationItemSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="mt-2">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}

export function ConversationList({
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchText, setSearchText] = useState('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    isLoading: isInitialConversationsLoading,
    fetchNextPage: fetchNextConversationsPage,
    hasNextPage: hasNextConversationsPage,
    isFetchingNextPage: isFetchingNextConversationsPage,
  } = useGetConversations();

  const {
    query: searchQuery,
    conversations: searchResults,
    isLoading: isSearchLoading,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
  } = useSearchConversations(searchText);

  const { onlineUsers } = usePresenceStore();

  const isSearchInputActive = searchText.trim().length > 0;

  useEffect(() => {
    if (!loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        const loadMore = async () => {
          if (isSearchInputActive) {
            if (hasNextSearchPage && !isFetchingNextSearchPage) {
              await fetchNextSearchPage();
            }
            return;
          }
          if (hasNextConversationsPage && !isFetchingNextConversationsPage) {
            await fetchNextConversationsPage();
          }
        };
        void loadMore();
      },
      {
        root: null,
        threshold: 0.1,
      },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [
    isSearchInputActive,
    hasNextConversationsPage,
    isFetchingNextConversationsPage,
    fetchNextConversationsPage,
    hasNextSearchPage,
    isFetchingNextSearchPage,
    fetchNextSearchPage,
  ]);

  const conversations = data?.conversations ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-gray-200 p-4">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Messages</h2>
        <InputGroup className="focus-within:border-blue-primary focus-within:ring-blue-primary h-10 rounded-full border-gray-200 bg-gray-50 shadow-none transition-colors focus-within:ring-1 mb-3">
          <InputGroupAddon className="pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search conversations..."
            className="border-0 bg-transparent text-sm shadow-none outline-none focus:ring-0"
          />
        </InputGroup>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Initial conversations loading */}
        {isInitialConversationsLoading && !isSearchInputActive && (
          <div>
            {Array.from({ length: 10 }).map((_, index) => (
              <ConversationItemSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Search loading */}
        {isSearchLoading && isSearchInputActive && (
          <div className="flex justify-center p-4">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        )}

        {/* Normal conversation list */}
        {!isInitialConversationsLoading &&
          !isSearchInputActive &&
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.conversationId}
              conversation={conversation}
              isActive={conversation.conversationId === activeConversationId}
              onClick={() =>
                onSelectConversation({
                  conversationId: conversation.conversationId,
                  otherUser: conversation.otherUser,
                })
              }
              isOnline={onlineUsers.has(conversation.otherUser.userId)}
            />
          ))}

        {/* Search result */}
        {!isSearchLoading &&
          isSearchInputActive &&
          searchResults.map((user) => (
            <ConversationPreview
              key={user.conversationId}
              user={user}
              onClick={() =>
                onSelectConversation({
                  conversationId: user.conversationId,
                  otherUser: {
                    userId: user.userId,
                    username: user.username,
                    profileImageUrl: user.profileImageUrl,
                  },
                })
              }
            />
          ))}

        {/* Empty normal conversations */}
        {!isInitialConversationsLoading &&
          !isSearchInputActive &&
          conversations.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              No conversations yet.
            </div>
          )}

        {/* Empty search result */}
        {!isSearchLoading &&
          isSearchInputActive &&
          searchQuery &&
          searchResults.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              No users found for "{searchQuery}".
            </div>
          )}

        {/* Infinite scroll trigger and loading */}
        {!isInitialConversationsLoading && (
          <div ref={loadMoreRef} className="h-1" />
        )}

        {(isFetchingNextConversationsPage || isFetchingNextSearchPage) && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
