import type {
  NotificationActor,
  NotificationDto,
} from '@/features/notification/types/notification.dto';
import { NOTIFICATION_TYPE } from '@/shared/types/notification';
import type { LucideIcon } from 'lucide-react';
import { MessageCircle, Bell, UserPlus, UserCheck } from 'lucide-react';

interface NotificationMeta {
  message: string;
  Icon: LucideIcon;
  iconBg: string;
}

const NOTIFICATION_META: Record<string, NotificationMeta> = {
  [NOTIFICATION_TYPE.MESSAGE]: {
    message: 'You have received a new message',
    Icon: MessageCircle,
    iconBg: 'bg-blue-500',
  },

  [NOTIFICATION_TYPE.FOLLOW_REQUEST]: {
    message: 'sent you a follow request',
    Icon: UserPlus,
    iconBg: 'bg-green-500',
  },

  [NOTIFICATION_TYPE.FOLLOW_ACCEPTED]: {
    message: 'accepted your follow request',
    Icon: UserCheck,
    iconBg: 'bg-green-500',
  },
};

const DEFAULT_NOTIFICATION_META: NotificationMeta = {
  message: 'You have a new notification',
  Icon: Bell,
  iconBg: 'bg-gray-500',
};

export function formatNotificationActors(
  actors: NotificationActor[],
  actorCount: number,
): string {
  const visibleActors = actors.slice(0, 3);
  const usernames = visibleActors.map((actor) => actor.username);

  const remainingCount = Math.max(actorCount - visibleActors.length, 0);

  if (usernames.length === 0) {
    return 'Someone';
  }

  if (remainingCount > 0) {
    return `${usernames.join(', ')} and ${remainingCount} others`;
  }

  if (usernames.length === 1) {
    return usernames[0] ?? 'Someone';
  }

  if (usernames.length === 2) {
    return `${usernames[0] ?? ''} and ${usernames[1] ?? ''}`;
  }

  return `${usernames.slice(0, -1).join(', ')} and ${
    usernames[usernames.length - 1] ?? ''
  }`;
}

export function formatNotificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

export function getNotificationMeta(
  notification: NotificationDto,
): NotificationMeta {
  return NOTIFICATION_META[notification.type] ?? DEFAULT_NOTIFICATION_META;
}

export function getNotificationActors(
  notification: NotificationDto,
): NotificationActor[] {
  const { metadata } = notification;

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return [];
  }

  const actors = (metadata as { actors?: unknown }).actors;

  if (!Array.isArray(actors)) {
    return [];
  }

  return actors as NotificationActor[];
}
