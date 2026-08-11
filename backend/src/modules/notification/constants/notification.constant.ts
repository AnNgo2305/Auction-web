import type { NotificationType, Prisma } from '@generated/prisma/client';

export interface NotificationPayload {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  entityType: string;
  metadata?: Prisma.InputJsonValue;
}

export interface ActorSnapshot {
  userId: string;
  username: string;
  fullName: string | null;
  profileImageUrl: string | null;

  // Only used for MESSAGE notifications.
  messageId?: string;
}
