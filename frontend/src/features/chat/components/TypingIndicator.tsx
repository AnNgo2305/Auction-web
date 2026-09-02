import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';

type TypingIndicatorProps = {
  username: string;
  profileImageUrl: string | null;
};

export function TypingIndicator({
  username,
  profileImageUrl,
}: TypingIndicatorProps) {
  const avatarUrl = profileImageUrl ?? defaultAvatarImageUrl;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-gray-900">{username}</div>

        <div className="mt-1 flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
        </div>
      </div>
    </div>
  );
}
