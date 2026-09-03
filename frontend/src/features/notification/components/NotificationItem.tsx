import type { NotificationDto } from '@/features/notification/types/notification.dto';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from '@/shared/ui/avatar';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import {
  formatNotificationActors,
  getNotificationActors,
  getNotificationMeta,
  formatNotificationTime,
} from '@/features/notification/utils/format-notification';

type NotificationItemProps = {
  notification: NotificationDto;
  onClick?: (notification: NotificationDto) => void;
};

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const actors = getNotificationActors(notification);
  const visibleActors = actors.slice(0, 3);
  const remainingCount = Math.max(
    notification.actorCount - visibleActors.length,
    0,
  );

  const actorText = formatNotificationActors(actors, notification.actorCount);
  const { message, Icon, iconBg } = getNotificationMeta(notification);
  const time = formatNotificationTime(notification.createdAt);

  return (
    <Button
      type="button"
      onClick={() => onClick?.(notification)}
      className={cn(
        'flex h-auto w-full items-start gap-3 rounded-none px-4 py-3',
        'bg-white text-left text-gray-900',
        'hover:bg-gray-50',
        !notification.isRead && 'bg-blue-50/60 hover:bg-blue-50',
      )}
    >
      <div className="relative shrink-0">
        <AvatarGroup>
          {visibleActors.map((actor) => (
            <Avatar key={actor.userId} size="lg">
              <AvatarImage
                src={actor.profileImageUrl ?? defaultAvatarImageUrl}
                alt={actor.username}
              />
              <AvatarFallback>
                {actor.fullName?.[0] ?? actor.username[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          ))}

          {remainingCount > 0 && (
            <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>
          )}
        </AvatarGroup>

        <div
          className={cn(
            'absolute -right-1 -bottom-1',
            'flex size-5 items-center justify-center',
            'rounded-full text-white',
            'ring-2 ring-white',
            iconBg,
          )}
        >
          <Icon className="size-3" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-gray-900">
          <span className="font-semibold">{actorText}</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">{message}</p>
        <p className="mt-1 text-xs text-gray-400">{time}</p>
      </div>

      {!notification.isRead && (
        <div className="flex h-10 shrink-0 items-center">
          <span className="size-2.5 rounded-full bg-blue-500" />
        </div>
      )}
    </Button>
  );
}
