export const NOTIFICATION_EVENTS = {
  // Server emits → Reading client receives
  // Server notifies the client that a new notification has been created.
  NEW_NOTIFICATION: 'notification:new',

  // Server emits → Reading client receives
  // Server sends the updated number of unread notifications to the client.
  UNREAD_COUNT: 'notification:unread-count',
} as const;
