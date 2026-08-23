import { MessageData } from '@/features/chat/types/message/message';
import { MessageBubble } from './MessageBubble';
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  MessageScrollerViewport,
} from '@/shared/ui/message-scroller';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

export type MessageListProps = {
  messages: MessageData[];
  currentUserId: string;
  peerLastReadAt: string | null;
  isPeerOnline: boolean;
  downloadUrls: Record<string, string>;

  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;

  onEditRequest?: (messageId: string) => void;
  onDeleteRequest?: (messageId: string) => void;
  onReplyRequest: (messageId: string) => void;
};

export function MessageList({
  messages,
  currentUserId,
  peerLastReadAt,
  isPeerOnline,
  hasMore,
  onLoadMore,
  isLoadingMore,
  downloadUrls,
  onEditRequest,
  onDeleteRequest,
  onReplyRequest,
}: MessageListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number | null>(null);
  const shouldRestoreScrollRef = useRef(false);

  const displayMessages = [...messages].reverse();

  const lastOwnMessageId =
    messages.find((message) => message.sender.userId === currentUserId)
      ?.messageId ?? null;

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !hasMore || isLoadingMore) return;

    if (viewport.scrollTop < 100) {
      previousScrollHeightRef.current = viewport.scrollHeight;
      shouldRestoreScrollRef.current = true;
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    if (!shouldRestoreScrollRef.current) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const previousScrollHeight = previousScrollHeightRef.current;
    if (previousScrollHeight === null) {
      return;
    }

    const heightDifference = viewport.scrollHeight - previousScrollHeight;
    viewport.scrollTop += heightDifference;

    previousScrollHeightRef.current = null;
    shouldRestoreScrollRef.current = false;
  }, [messages.length]);

  return (
    <MessageScroller className="flex-1">
      <MessageScrollerViewport ref={viewportRef} onScroll={handleScroll}>
        <MessageScrollerContent className="gap-1 px-4 py-4">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {displayMessages.map((message, index) => {
            const nextMessage = displayMessages[index + 1];

            const isMine = message.sender.userId === currentUserId;
            const showAvatar =
              !isMine &&
              (!nextMessage ||
                nextMessage.sender.userId !== message.sender.userId);

            return (
              <MessageScrollerItem key={message.messageId}>
                <MessageBubble
                  message={message}
                  showAvatar={showAvatar}
                  isLastOwnMessage={message.messageId === lastOwnMessageId}
                  isMine={isMine}
                  peerLastReadAt={peerLastReadAt}
                  isPeerOnline={isPeerOnline}
                  downloadUrls={downloadUrls}
                  onEditRequest={onEditRequest}
                  onDeleteRequest={onDeleteRequest}
                  onReplyRequest={onReplyRequest}
                />
              </MessageScrollerItem>
            );
          })}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton direction="end" />
    </MessageScroller>
  );
}
