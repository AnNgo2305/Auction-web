import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import { formatPresence } from '@/features/chat/utils/format-presence.ts';
import { cn } from '@/shared/lib/utils.ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profilePaths } from '@/features/profile/constants/profile.routes';

type OtherUser = {
  userId: string;
  username: string;
  profileImageUrl: string | null;
};

type ChatHeaderProps = {
  otherUser: OtherUser;
  isOnline: boolean;
  lastSeen: string | null;
  onDeleteConversation: () => void;
};

export function ChatHeader({
  otherUser,
  isOnline,
  lastSeen,
  onDeleteConversation,
}: ChatHeaderProps) {
  const navigate = useNavigate();
  const [_forceTick, setForceTick] = useState(0);

  useEffect(() => {
    if (isOnline || !lastSeen) {
      return;
    }

    const id = setInterval(() => {
      setForceTick((x) => x + 1);
    }, 60000);

    return () => clearInterval(id);
  }, [isOnline, lastSeen]);

  const presence = formatPresence(isOnline, lastSeen);

  const handleOpenProfile = () => {
    void navigate(profilePaths.overview(otherUser.userId));
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          onClick={handleOpenProfile}
          className="hover:bg-muted/50 flex min-w-0 items-center gap-3 rounded-md text-left transition-colors"
        >
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherUser.profileImageUrl ?? defaultAvatarImageUrl}
                alt={otherUser.username}
              />
              <AvatarFallback>
                {otherUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {presence.showDot && (
              <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">
              {otherUser.username}
            </p>
            <p
              className={cn(
                'text-xs',
                presence.variant === 'online'
                  ? 'text-green-600'
                  : presence.variant === 'recent'
                    ? 'text-gray-600'
                    : presence.variant === 'away'
                      ? 'text-gray-500'
                      : 'text-gray-400',
              )}
            >
              {presence.text}
            </p>
          </div>
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Conversation actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500"
            onClick={onDeleteConversation}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
