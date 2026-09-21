import type { NotificationDto } from '@/features/notification/types/notification.dto';
import { NOTIFICATION_TYPE } from '@/shared/types/notification';
import { chatPaths } from '@/features/chat/constants/chat.routes';
import { profilePaths } from '@/features/profile/constants/profile.routes';
import { auctionPaths } from '@/features/auction/constants/auction.routes';

export function getNotificationHref(notification: NotificationDto): string {
  const { type, entityId } = notification;

  switch (type) {
    case NOTIFICATION_TYPE.MESSAGE:
      return chatPaths.conversation(entityId);

    case NOTIFICATION_TYPE.FOLLOW_REQUEST:
    case NOTIFICATION_TYPE.FOLLOW_ACCEPTED:
      return profilePaths.overview(entityId);

    case NOTIFICATION_TYPE.AUCTION_CREATED:
    case NOTIFICATION_TYPE.AUCTION_UPDATED:
    case NOTIFICATION_TYPE.AUCTION_CANCELLED:
    case NOTIFICATION_TYPE.AUCTION_STARTED:
    case NOTIFICATION_TYPE.AUCTION_EXTENDED:
    case NOTIFICATION_TYPE.AUCTION_COMPLETED:
    case NOTIFICATION_TYPE.AUCTION_REOPENED:
    case NOTIFICATION_TYPE.AUCTION_CLOSED:
      return auctionPaths.detail(entityId);

    default:
      return '/';
  }
}
