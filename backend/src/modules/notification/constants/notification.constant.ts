import type { NotificationType, Prisma } from '@generated/prisma/client';

export interface NotificationPayload {
  eventId?: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  entityType: string;
  metadata?: Prisma.InputJsonObject;
}

export interface ActorSnapshot {
  userId: string;
  username: string;
  fullName: string | null;
  profileImageUrl: string | null;
}
