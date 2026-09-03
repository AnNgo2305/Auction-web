import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { notificationApi } from '@/features/notification/api/notification.api';
import { notificationKeys } from '@/features/notification/constants/notification-query-key';
import type { GetNotificationsResponse } from '@/features/notification/types/get-notifications.response';

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),

    onSuccess: () => {
      queryClient.setQueryData<InfiniteData<GetNotificationsResponse>>(
        notificationKeys.list(),
        (currentCache) => {
          if (!currentCache) return currentCache;

          return {
            ...currentCache,
            pages: currentCache.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                notifications: page.data.notifications.map((notification) => ({
                  ...notification,
                  isRead: true,
                  readAt: notification.readAt ?? new Date().toISOString(),
                })),
              },
            })),
          };
        },
      );

      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
    },
  });
}
