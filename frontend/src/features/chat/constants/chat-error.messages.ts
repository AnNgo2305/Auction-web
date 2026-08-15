export const DELETE_CONVERSATION_ERROR_MESSAGES: Record<string, string> = {
  CONVERSATION_NOT_FOUND:
    'We couldn’t find this conversation. It may have already been deleted.',

  DEFAULT:
    'Something went wrong while deleting this conversation. Please try again.',
} as const;

export const CREATE_OR_GET_CONVERSATION_ERROR_MESSAGES: Record<
  string,
  string
> = {
  CANNOT_CREATE_CONVERSATION_WITH_SELF:
    'You cannot create a conversation with yourself.',

  RECIPIENT_NOT_FOUND:
    'We couldn’t find this user. Please check the recipient and try again.',

  CONVERSATION_CREATION_TIMEOUT:
    'We couldn’t create the conversation right now. Please try again later.',

  DEFAULT:
    'Something went wrong while creating the conversation. Please try again.',
} as const;
