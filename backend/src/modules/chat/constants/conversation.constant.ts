export const ERROR_CANNOT_CREATE_CONVERSATION_WITH_SELF = {
  statusCode: 409,
  errorCode: 'CANNOT_CREATE_CONVERSATION_WITH_SELF',
  message: 'You cannot create a conversation with yourself',
};

export const ERROR_RECIPIENT_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'RECIPIENT_NOT_FOUND',
  message: 'Recipient not found or invalid',
};

export const ERROR_CONVERSATION_CREATION_TIMEOUT = {
  statusCode: 409,
  errorCode: 'CONVERSATION_CREATION_TIMEOUT',
  message: 'Unable to create conversation. Please try again later',
};

export const ERROR_CONVERSATION_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'CONVERSATION_NOT_FOUND',
  message: 'Conversation not found',
};

export const CONVERSATION_SELECT = {
  conversationId: true,
  initiator: {
    select: {
      userId: true,
      username: true,
      profile: {
        select: {
          profileImageUrl: true,
        },
      },
    },
  },
  recipient: {
    select: {
      userId: true,
      username: true,
      profile: {
        select: {
          profileImageUrl: true,
        },
      },
    },
  },
  lastMessage: {
    select: {
      messageId: true,
      content: true,
      type: true,
      senderId: true,
      createdAt: true,
    },
  },
} as const;
