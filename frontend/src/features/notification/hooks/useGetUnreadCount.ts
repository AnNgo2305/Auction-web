import { useQuery } from '@tanstack/react-query';

import { notificationApi } from '@/features/notification/api/notification.api';
import { notificationKeys } from '@/features/notification/constants/notification-query-key';

export function useGetUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await notificationApi.getUnreadCount();
      return response.data.unreadCount;
    },
  });
}
