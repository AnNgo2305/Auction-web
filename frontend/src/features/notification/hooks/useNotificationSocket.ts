import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/shared/contexts/UserContext';
import { NOTIFICATION_EVENTS } from '@/features/notification/constants/notification-socket.constant';
import { notificationKeys } from '@/features/notification/constants/notification-query-key';
import { useGetUnreadNotificationCount } from '@/features/notification/hooks/useGetUnreadCount.ts';
import type { NotificationDto } from '@/features/notification/types/notification.dto.ts';
import { NOTIFICATION_TYPE } from '@/shared/types/notification.ts';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { profileKeys } from '@/features/profile/constants/profile-query-key';

type NotificationUnreadCountEvent = {
  unreadCount: number;
};

function invalidateNotificationEntity(
  queryClient: QueryClient, notification: NotificationDto,
): void {
  switch (notification.type) {
    case NOTIFICATION_TYPE.AUCTION_CREATED:
    case NOTIFICATION_TYPE.AUCTION_UPDATED:
    case NOTIFICATION_TYPE.AUCTION_CANCELLED:
    case NOTIFICATION_TYPE.AUCTION_STARTED:
    case NOTIFICATION_TYPE.AUCTION_EXTENDED:
    case NOTIFICATION_TYPE.AUCTION_COMPLETED:
    case NOTIFICATION_TYPE.AUCTION_REOPENED:
    case NOTIFICATION_TYPE.AUCTION_CLOSED:
    case NOTIFICATION_TYPE.AUCTION_RESUBMITTED:
      void queryClient.invalidateQueries({
        queryKey: auctionKeys.detail(notification.entityId),
      });
      break;

    case NOTIFICATION_TYPE.FOLLOW_REQUEST:
    case NOTIFICATION_TYPE.FOLLOW_ACCEPTED:
      void queryClient.invalidateQueries({
        queryKey: profileKeys.detail(notification.entityId),
      });
      break;

    default:
      break;
  }
}

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
      (notification: NotificationDto) => {
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.list(),
        });

        invalidateNotificationEntity(queryClient, notification);

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
