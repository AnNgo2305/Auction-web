import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/shared/contexts/UserContext';
import { NOTIFICATION_EVENTS } from '@/features/notification/constants/notification-socket.constant';
import { notificationKeys } from '@/features/notification/constants/notification-query-key';
import type { NotificationDto } from '@/features/notification/types/notification.dto';
import { useGetUnreadNotificationCount } from '@/features/notification/hooks/useGetUnreadCount.ts';

type NotificationNewEvent = {
  notification: NotificationDto;
};

type NotificationUnreadCountEvent = {
  unreadCount: number;
};

export function useNotificationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUser();
  const { refetch: refetchUnreadCount } = useGetUnreadNotificationCount();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      void refetchUnreadCount();
    });

    socket.on(
      NOTIFICATION_EVENTS.NEW_NOTIFICATION,
      ({ notification }: NotificationNewEvent) => {
        queryClient.setQueryData<{
          notifications: NotificationDto[];
        }>(notificationKeys.list(), (currentData) => {
          if (!currentData) {
            return {
              notifications: [notification],
            };
          }

          const exists = currentData.notifications.some(
            (item) => item.notificationId === notification.notificationId,
          );

          if (exists) {
            return currentData;
          }

          return {
            ...currentData,
            notifications: [notification, ...currentData.notifications],
          };
        });
      },
    );

    socket.on(
      NOTIFICATION_EVENTS.UNREAD_COUNT,
      ({ unreadCount }: NotificationUnreadCountEvent) => {
        queryClient.setQueryData(notificationKeys.unreadCount(), unreadCount);
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient, refetchUnreadCount]);

  return socketRef;
}
