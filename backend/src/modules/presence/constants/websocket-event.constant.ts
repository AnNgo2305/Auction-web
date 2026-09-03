export const PRESENCE_EVENTS = {
  // Client emits → Server receives
  // Keeps the WebSocket connection alive and refreshes the client's heartbeat.
  HEARTBEAT: 'presence:heartbeat',

  // Server emits → Sending client receives
  // Confirms that the server received the heartbeat.
  HEARTBEAT_ACK: 'presence:ack',

  // Client emits → Server receives
  // Subscribes the client to presence updates of the specified users.
  PRESENCE_SUBSCRIBE: 'presence:subscribe',

  // Client emits → Server receives
  // Unsubscribes the client from presence updates of the specified users.
  PRESENCE_UNSUBSCRIBE: 'presence:unsubscribe',

  // Server emits → Sending client receives
  // Sends the current online/last-seen state of the subscribed users.
  PRESENCE_SNAPSHOT: 'presence:snapshot',

  // Server emits → All watching clients receive
  // Notifies clients that a watched user has become online.
  PRESENCE_ONLINE: 'presence:online',

  // Server emits → All watching clients receive
  // Notifies clients that a watched user has become offline.
  PRESENCE_OFFLINE: 'presence:offline',
} as const;
