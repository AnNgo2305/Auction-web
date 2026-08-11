export const NOTIFICATION_EVENTS = {
  // Server → Client (New notification message)
  NEW_NOTIFICATION: 'notification.new-notification',

  // Server → Client (Update unread count)
  UNREAD_COUNT: 'notification.unread-counter',
} as const;
