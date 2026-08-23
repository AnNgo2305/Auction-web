export const PRESENCE_EVENTS = {
  HEARTBEAT: 'presence:heartbeat',

  HEARTBEAT_ACK: 'presence:ack',

  PRESENCE_SUBSCRIBE: 'presence:subscribe',

  PRESENCE_UNSUBSCRIBE: 'presence:unsubscribe',

  PRESENCE_SNAPSHOT: 'presence:snapshot',

  PRESENCE_ONLINE: 'presence:online',

  PRESENCE_OFFLINE: 'presence:offline',

  EXCEPTION: 'exception',
} as const;
