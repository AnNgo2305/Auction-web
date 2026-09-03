import { api } from '@/shared/api/axios';
import type { GetNotificationsResponse } from '@/features/notification/types/get-notifications.response.ts';
import type { GetUnreadCountResponse } from '@/features/notification/types/get-unread-count.response';
import type { MarkNotificationAsReadResponse } from '@/features/notification/types/mark-notification-as-read.response';
import type { MarkAllNotificationsAsReadResponse } from '@/features/notification/types/mark-all-notifications-as-read.response';

const NOTIFICATION_API_PREFIX = '/notifications';

export const notificationApi = {
  getNotifications: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<GetNotificationsResponse> => {
    const res = await api.get<GetNotificationsResponse>(
      NOTIFICATION_API_PREFIX,
      {
        params,
      },
    );

    return res.data;
  },

  getUnreadCount: async (): Promise<GetUnreadCountResponse> => {
    const res = await api.get<GetUnreadCountResponse>(
      `${NOTIFICATION_API_PREFIX}/unread`,
    );

    return res.data;
  },

  markAsRead: async (
    notificationId: string,
  ): Promise<MarkNotificationAsReadResponse> => {
    const res = await api.patch<MarkNotificationAsReadResponse>(
      `${NOTIFICATION_API_PREFIX}/${notificationId}/read`,
    );

    return res.data;
  },

  markAllAsRead: async (): Promise<MarkAllNotificationsAsReadResponse> => {
    const res = await api.patch<MarkAllNotificationsAsReadResponse>(
      `${NOTIFICATION_API_PREFIX}/read-all`,
    );

    return res.data;
  },
};
