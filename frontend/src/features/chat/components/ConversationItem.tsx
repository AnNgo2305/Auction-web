import type { ConversationItem as ConversationItemType } from '@/features/chat/types/conversation/conversation-list.response';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import { cn } from '@/shared/lib/utils';
import { MESSAGE_TYPE } from '@/shared/types/message';
import { useUser } from '@/shared/contexts/UserContext';
import { formatIsoToNow } from '@/shared/utils/format-time';

type ConversationItemProps = {
  conversation: ConversationItemType;
  isActive: boolean;
  isOnline: boolean;
  onClick: (conversationId: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  isOnline,
  onClick,
}: ConversationItemProps) {
  const { currentUser } = useUser();
  const avatarUrl =
    conversation.otherUser.profileImageUrl ?? defaultAvatarImageUrl;
  const displayName = conversation.otherUser.username;

  const handleClick = () => {
    onClick(conversation.conversationId);
  };

  const lastMessagePreview = (() => {
    if (!conversation.lastMessage) {
      return 'Start a conversation';
    }

    const { lastMessage } = conversation;
    const isMine = lastMessage.senderId === currentUser?.userId;

    switch (lastMessage.type) {
      case MESSAGE_TYPE.IMAGE:
        return isMine ? 'You: Sent an image' : 'Sent an image';

      case MESSAGE_TYPE.FILE:
        return isMine ? 'You: Sent a file' : 'Sent a file';

      case MESSAGE_TYPE.TEXT: {
        const content = lastMessage.content?.trim();
        if (!content) {
          return isMine ? 'You: Sent a message' : 'Sent a message';
        }
        return isMine ? `You: ${content}` : content;
      }

      default:
        return isMine ? 'You: Sent a message' : 'Sent a message';
    }
  })();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      className={cn(
        'h-auto w-full justify-start gap-3 rounded-none px-4 py-3',
        'hover:bg-muted/50 text-left',
        isActive && 'bg-muted',
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          <AvatarBadge
            className={cn(
              'border-background right-0 bottom-0',
              isOnline ? 'bg-green-500' : 'bg-muted-foreground',
            )}
          />
        </Avatar>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm font-semibold',
              conversation.unreadCount > 0 && 'font-bold',
            )}
          >
            {displayName}
          </span>
          {conversation.lastMessage && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {formatIsoToNow(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-muted-foreground truncate text-sm',
              conversation.unreadCount > 0 && 'text-foreground font-medium',
            )}
          >
            {lastMessagePreview}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Button>
  );
}
