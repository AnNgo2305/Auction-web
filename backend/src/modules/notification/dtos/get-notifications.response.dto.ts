import type { NotificationDto } from '@modules/notification/dtos/notification.dto';

export class GetNotificationsResponseDto {
  notifications: NotificationDto[];

  nextCursor: string | null;
}
