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

export const FOLLOW_NOTIFICATION_QUEUE = {
  NAME: 'notification-follow',
  JOBS: {
    FOLLOW_REQUESTED: 'follow-requested',
    FOLLOW_ACCEPTED: 'follow-accepted',
  },
} as const;

export const AUCTION_QUEUE = {
  NAME: 'auction',
  JOBS: {
    OPEN_AUCTION: 'open-auction',
    EXTEND_AUCTION: 'extend-auction',
    CLOSE_AUCTION: 'close-auction',
    COMPLETE_AUCTION: 'complete-auction',
  },
} as const;
