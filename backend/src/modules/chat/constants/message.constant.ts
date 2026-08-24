export const MESSAGE_SELECT = {
  messageId: true,
  conversationId: true,
  sender: {
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
  type: true,
  content: true,
  fileKey: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  isRead: true,
  createdAt: true,
  readAt: true,
  updatedAt: true,
  replyToMessage: {
    select: {
      messageId: true,
      sender: {
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
      type: true,
      content: true,
      fileKey: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  },
} as const;

export const ERROR_REPLY_MESSAGE_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'REPLY_MESSAGE_NOT_FOUND',
  message: 'The message being replied to was not found',
};

export const ERROR_MESSAGE_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'MESSAGE_NOT_FOUND',
  message: 'Message not found',
};

export const ERROR_CANNOT_EDIT_MESSAGE = {
  statusCode: 403,
  errorCode: 'CANNOT_EDIT_MESSAGE',
  message: 'You are not allowed to edit this message',
};

export const ERROR_ONLY_TEXT_MESSAGE_CAN_BE_EDITED = {
  statusCode: 400,
  errorCode: 'ONLY_TEXT_MESSAGE_CAN_BE_EDITED',
  message: 'Only text messages can be edited',
};

export const MAX_CHAT_ATTACHMENTS = 10;
