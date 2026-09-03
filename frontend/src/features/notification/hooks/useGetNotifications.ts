import { useInfiniteQuery } from '@tanstack/react-query';
import { notificationApi } from '@/features/notification/api/notification.api';
import { notificationKeys } from '@/features/notification/constants/notification-query-key';
import type { GetNotificationsResponse } from '@/features/notification/types/get-notifications.response';

export function useGetNotifications(limit = 10) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,

    queryFn: async ({ pageParam }): Promise<GetNotificationsResponse> => {
      return await notificationApi.getNotifications({
        limit,
        cursor: pageParam,
      });
    },

    getNextPageParam: (lastPage) => {
      return lastPage.data.nextCursor ?? undefined;
    },

    select: ({ pages }) => ({
      notifications: pages.flatMap((page) => page.data.notifications),
    }),
  });
}
