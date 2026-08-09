import type { NotificationType, Prisma } from '@generated/prisma/client';

export const NOTIFICATION_EVENTS = {
  NEW_MESSAGE: 'notification.new-message',
} as const;

export interface NotificationPayload {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  entityType: string;
  metadata?: Prisma.InputJsonValue;
}

export const AGGREGATION_TTL_SECONDS = 30;
export const NOTIFICATION_DEDUP_TTL_SECONDS = 5 * 60;

export interface ActorSnapshot {
  userId: string;
  username: string;
  fullName: string | null;
  profileImageUrl: string | null;

  // Only used for MESSAGE notifications.
  messageId?: string;
}
