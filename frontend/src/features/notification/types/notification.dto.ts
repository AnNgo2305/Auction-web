import type { NotificationType } from '@/shared/types/notification';

export type NotificationDto = {
  notificationId: string;

  recipientId: string;

  actorId: string | null;

  type: NotificationType;

  entityId: string;

  entityType: string;

  metadata: unknown;

  isRead: boolean;

  createdAt: string;

  readAt: string | null;
};
