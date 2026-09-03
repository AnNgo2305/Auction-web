import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { notificationApi } from '@/features/notification/api/notification.api';
import { notificationKeys } from '@/features/notification/constants/notification-query-key';
import type { GetNotificationsResponse } from '@/features/notification/types/get-notifications.response';

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markAsRead(notificationId),

    onSuccess: (response) => {
      const notification = response.data;
      queryClient.setQueryData<InfiniteData<GetNotificationsResponse>>(
        notificationKeys.list(),
        (currentCache) => {
          if (!currentCache) return currentCache;
          let wasUnread = false;

          const pages = currentCache.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              notifications: page.data.notifications.map((item) => {
                if (item.notificationId === notification.notificationId) {
                  wasUnread = !item.isRead;
                  return notification;
                }
                return item;
              }),
            },
          }));

          if (wasUnread) {
            queryClient.setQueryData<number>(
              notificationKeys.unreadCount(),
              (currentCount) => Math.max((currentCount ?? 0) - 1, 0),
            );
          }

          return {
            ...currentCache,
            pages,
          };
        },
      );
    },
  });
}
