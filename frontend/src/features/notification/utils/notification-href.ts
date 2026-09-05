import type { NotificationDto } from '@/features/notification/types/notification.dto';
import { NOTIFICATION_TYPE } from '@/shared/types/notification';
import { chatPaths } from '@/features/chat/constants/chat.routes';
import { profilePaths } from '@/features/profile/constants/profile.routes';

export function getNotificationHref(notification: NotificationDto): string {
  const { type, entityId } = notification;

  switch (type) {
    case NOTIFICATION_TYPE.MESSAGE:
      return chatPaths.conversation(entityId);

    case NOTIFICATION_TYPE.FOLLOW_REQUEST:
    case NOTIFICATION_TYPE.FOLLOW_ACCEPTED:
      return profilePaths.overview(entityId);

    default:
      return '/';
  }
}
