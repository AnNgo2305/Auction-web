export const CHAT_EVENTS = {
  // Client emits → Server receives
  // Client emits this event to send a new message.
  MESSAGE_SEND: 'message:send',

  // Server emits → Sending client receives
  // Server emits this event back to the client when a message operation fails (SEND | UPDATE | DELETE).
  MESSAGE_ERROR: 'message:error',

  // Server emits → Sending client receives
  // Server confirms that the message was successfully sent and persisted.
  MESSAGE_ACK: 'message:ack',

  // Server emits → Other clients in conversation receive
  // Server notifies other clients that a new message was created.
  MESSAGE_NEW: 'message:new',

  // Client emits → Server receives
  // Client emits this event to request an update to an existing message.
  MESSAGE_UPDATE: 'message:update',

  // Server emits → All clients in conversation receive
  // Server notifies clients that an existing message was updated.
  MESSAGE_UPDATED: 'message:updated',

  // Client emits → Server receives
  // Client emits this event to delete an existing message.
  MESSAGE_DELETE: 'message:delete',

  // Server emits → All clients in conversation receive
  // Server notifies clients that an existing message was deleted.
  MESSAGE_DELETED: 'message:deleted',

  // Server emits → All clients in conversation receive
  // Server notifies clients that the conversation information was updated.
  CONVERSATION_UPDATED: 'conversation:updated',

  // Client emits → Server receives
  // Client emits this event to mark a message as read.
  MESSAGE_READ: 'message:read',

  // Server emits → Sending client receives
  // Server confirms that the message has been successfully marked as read.
  MESSAGE_READ_ACK: 'message:read:ack',

  // Server emits → Other clients in conversation receive
  // Server notifies other clients that the message was read.
  MESSAGE_SEEN: 'message:seen',

  // Client emits → Server receives
  // Server emits → Other clients in conversation receive
  // Indicates that a user in conversation started typing.
  TYPING_START: 'typing:start',

  // Client emits → Server receives
  // Server emits → Other clients in conversation receive
  // Indicates that a user in conversation stopped typing.
  TYPING_STOP: 'typing:stop',
} as const;

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
