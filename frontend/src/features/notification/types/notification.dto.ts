import type { NotificationType } from '@/shared/types/notification';

export type NotificationActor = {
  userId: string;
  username: string;
  fullName: string | null;
  profileImageUrl: string | null;
};

export type NotificationMetadata = {
  actors: NotificationActor[];
  title?: string;
  isManual?: boolean;
  endTime?: string;
};

export type NotificationDto = {
  notificationId: string;

  recipientId: string;

  actorId: string | null;

  actorCount: number;

  type: NotificationType;

  entityId: string;

  entityType: string;

  metadata: NotificationMetadata | null;

  isRead: boolean;

  createdAt: string;

  readAt: string | null;
};
