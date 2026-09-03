import { useEffect, useRef } from 'react';
import { BellOff, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { NotificationItem } from '@/features/notification/components/NotificationItem';
import { useGetNotifications } from '@/features/notification/hooks/useGetNotifications';
import { useGetUnreadNotificationCount } from '@/features/notification/hooks/useGetUnreadCount';
import { useMarkNotificationAsRead } from '@/features/notification/hooks/useMarkNotificationAsRead';
import { useMarkAllNotificationsAsRead } from '@/features/notification/hooks/useMarkAllNotificationsAsRead';

import type { NotificationDto } from '@/features/notification/types/notification.dto';
import { getNotificationHref } from '@/features/notification/utils/notification-href.ts';
import { useNavigate } from 'react-router-dom';

type NotificationDropdownProps = {
  onClose: () => void;
};

export function NotificationDropDown({ onClose }: NotificationDropdownProps) {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetNotifications();
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useGetUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const notifications = data?.notifications ?? [];

  useEffect(() => {
    const element = sentinelRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry &&
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.notificationId);
    }

    onClose();

    void navigate(getNotificationHref(notification));
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    markAllAsRead.mutate();
  };

  return (
    <div className="flex h-120 w-90 flex-col overflow-hidden rounded-lg bg-white">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyNotification />
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
            <div ref={sentinelRef} className="h-1" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex animate-pulse gap-3 px-4 py-3">
          <div className="size-10 shrink-0 rounded-full bg-gray-200" />
          <div className="min-w-0 flex-1 space-y-2 py-1">
            <div className="h-3 w-4/5 rounded bg-gray-200" />
            <div className="h-3 w-3/5 rounded bg-gray-200" />
            <div className="h-2.5 w-1/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyNotification() {
  return (
    <div className="flex h-95 flex-col items-center justify-center gap-2 text-gray-400">
      <BellOff className="size-10 stroke-[1.5]" />
      <p className="text-sm">No notifications yet.</p>
    </div>
  );
}
