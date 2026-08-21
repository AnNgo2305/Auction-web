import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import type { SearchConversationItem } from '@/features/chat/types/conversation/search-conversations.response';

type ConversationPrewviewProps = {
  user: SearchConversationItem;
  onClick: (userId: string) => void;
};

export function ConversationPreview({ user, onClick }: ConversationPrewviewProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(user.conversationId)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
    >
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage
          src={user.profileImageUrl || defaultAvatarImageUrl}
          alt={user.username}
        />
        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {user.username}
        </p>
      </div>
    </button>
  );
}
