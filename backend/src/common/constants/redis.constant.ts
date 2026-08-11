export const REDIS_CLIENT = 'REDIS_CLIENT';

export const REDIS_LOCK_CONFIG = {
  CONVERSATION: {
    PREFIX: 'lock:conversation',
    VALUE: 'locked',
    TTL: 10,
    WAIT: {
      MAX_RETRY: 10,
      INTERVAL: 100,
    },
  },
};

export const REDIS_KEYS = {
  PRESENCE: {
    ONLINE_USERS: 'presence:online',
    USER_SOCKETS: (userId: string) => `presence:user-sockets:${userId}`,
    LAST_SEEN: (userId: string) => `presence:last-seen:${userId}`,
    HEARTBEAT: (socketId: string) => `presence:heartbeat:${socketId}`,
    WATCHERS: (userId: string) => `presence:watchers:${userId}`,
    WATCHING: (userId: string) => `presence:watching:${userId}`,
  },
  NOTIFICATION: {
    UNREAD_COUNT: (recipientId: string) =>
      `notification:unread-count:${recipientId}`,
    AGGREGATION: (recipientId: string, type: string, entityId: string) =>
      `notification:aggregation:${recipientId}:${type}:${entityId}`,
    AGGREGATION_ACTORS: (recipientId: string, type: string, entityId: string) =>
      `notification:aggregation:${recipientId}:${type}:${entityId}:actors`,
    AGGREGATION_META: (recipientId: string, type: string, entityId: string) =>
      `notification:aggregation:${recipientId}:${type}:${entityId}:meta`,
    AGGREGATION_PROCESSING: (
      recipientId: string,
      type: string,
      entityId: string,
    ) =>
      `notification:aggregation:${recipientId}:${type}:${entityId}:processing`,
    AGGREGATION_ACTORS_PROCESSING: (
      recipientId: string,
      type: string,
      entityId: string,
    ) =>
      `notification:aggregation:${recipientId}:${type}:${entityId}:actors:processing`,
    DEDUP: (type: string, entityId: string, recipientId: string) =>
      `notification:dedup:${type}:${entityId}:${recipientId}`,
  },
} as const;

export const REDIS_TTL = {
  PRESENCE: {
    USER_SOCKETS: 60,
    HEARTBEAT: 60,
    LAST_SEEN: 60 * 60 * 24,
  },
  NOTIFICATION: {
    AGGREGATION: 30,
    DEDUP: 5 * 60,
    UNREAD_COUNT: 60 * 60,
  },
} as const;

export const REDIS_RATE_LIMIT = {
  SEND_MESSAGE: {
    KEY: (userId: string) => `ws:rate-limit:send-message:${userId}`,
    LIMIT: 30,
    WINDOW: 10,
  },
  TYPING: {
    KEY: (userId: string) => `ws:rate-limit:typing:${userId}`,
    LIMIT: 10,
    WINDOW: 10,
  },
} as const;

export const REDIS_IDEMPOTENCY = {
  SEND_MESSAGE: {
    KEY: (userId: string, tempId: string) =>
      `ws:idempotency:send-message:${userId}:${tempId}`,
    TTL: 60,
  },
} as const;

export const IDEMPOTENCY_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
} as const;

export type IdempotencyStatus =
  (typeof IDEMPOTENCY_STATUS)[keyof typeof IDEMPOTENCY_STATUS];
