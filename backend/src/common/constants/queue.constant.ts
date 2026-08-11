export const MESSAGE_NOTIFICATION_QUEUE = {
  NAME: 'notification-message',
  JOBS: {
    MESSAGE_SENT: 'message-sent',
  },
} as const;

export const MAIL_QUEUE = {
  NAME: 'mail',
  JOBS: {
    SEND_MAIL: 'send-mail',
  },
} as const;
