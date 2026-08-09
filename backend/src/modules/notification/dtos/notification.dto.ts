import type { NotificationType, Prisma } from '@generated/prisma/client';

export class NotificationDto {
  notificationId: string;

  recipientId: string;

  actorId: string | null;

  type: NotificationType;

  entityId: string;

  entityType: string;

  metadata: Prisma.InputJsonValue | null;

  isRead: boolean;

  createdAt: Date;

  readAt: Date | null;
}
