export const NOTIFICATION_TYPE = {
  MESSAGE: 'MESSAGE',
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
