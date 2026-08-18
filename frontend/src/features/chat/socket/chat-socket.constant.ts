export const CHAT_EVENTS = {
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  MESSAGE_SEEN: 'message:seen',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  MESSAGE_UPDATE: 'message:update',
  MESSAGE_DELETE: 'message:delete',

  MESSAGE_ACK: 'message:ack',
  MESSAGE_ERROR: 'message:error',
  MESSAGE_NEW: 'message:new',
  CONVERSATION_UPDATED: 'conversation:updated',
  MESSAGE_UPDATED: 'message:updated',
  MESSAGE_DELETED: 'message:deleted',

  EXCEPTION: 'exception',
} as const;
