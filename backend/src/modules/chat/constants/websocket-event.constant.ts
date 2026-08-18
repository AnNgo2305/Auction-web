export const CHAT_EVENTS = {
  // Client → Server (Send message)
  MESSAGE_SEND: 'message:send',

  // Server → Client (Show error message sent)
  MESSAGE_ERROR: 'message:error',

  // Server → Client (Acknowledge message sent)
  MESSAGE_ACK: 'message:ack',

  // Client → Other conversation clients (Notify new message)
  MESSAGE_NEW: 'message:new',

  // Client → Server (Request to update an existing message)
  MESSAGE_UPDATE: 'message:update',

  // Server → Conversation clients (Notify clients that a message was updated)
  MESSAGE_UPDATED: 'message:updated',

  // Client → Server (Request to delete an existing message)
  MESSAGE_DELETE: 'message:delete',

  // Server → Conversation clients (Notify clients that a message was deleted)
  MESSAGE_DELETED: 'message:deleted',

  // Server → All conversation clients (Update conversation)
  CONVERSATION_UPDATED: 'conversation:updated',

  // Client → Server (Read message)
  MESSAGE_READ: 'message:read',

  // Client → Other conversation clients (Seen message)
  MESSAGE_SEEN: 'message:seen',

  // Client → Server (Start typing)
  TYPING_START: 'typing:start',

  // Client → Server (Stop typing)
  TYPING_STOP: 'typing:stop',
} as const;

export const PRESENCE_EVENTS = {
  // Client → Server (Keep the WebSocket connection alive)
  HEARTBEAT: 'presence:heartbeat',

  // Server → Client (Acknowledge presence)
  HEARTBEAT_ACK: 'presence:ack',

  // Client → Server (Subscribe to presence changes of specific users)
  PRESENCE_SUBSCRIBE: 'presence:subscribe',

  // Client → Server (Stop receiving presence changes of specific users)
  PRESENCE_UNSUBSCRIBE: 'presence:unsubscribe',

  // Server → Client (Send current presence state after subscription)
  PRESENCE_SNAPSHOT: 'presence:snapshot',

  // Server → Client (Notify that a watched user became online)
  PRESENCE_ONLINE: 'presence:online',

  // Server → Client (Notify that a watched user became offline)
  PRESENCE_OFFLINE: 'presence:offline',
} as const;
