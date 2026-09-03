import type { NotificationDto } from '@/features/notification/types/notification.dto';
import { NOTIFICATION_TYPE } from '@/shared/types/notification';
import { chatPaths } from '@/features/chat/constants/chat.routes';

export function getNotificationHref(notification: NotificationDto): string {
  const { type, entityId } = notification;

  switch (type) {
    case NOTIFICATION_TYPE.MESSAGE:
      return chatPaths.conversation(entityId);

    default:
      return '/';
  }
}
