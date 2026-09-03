export const NOTIFICATION_EVENTS = {
  // Server → Client
  // Sends a newly created notification to the recipient.
  NEW_NOTIFICATION: 'notification:new',

  // Server → Client
  // Sends the current unread notification count.
  UNREAD_COUNT: 'notification:unread-count',
} as const;
