export const CHAT_ROUTES = {
  ROOT: '',
  CONVERSATION: ':conversationId',
} as const;

export const chatPaths = {
  root: () => '/chat',
  conversation: (conversationId: string) => `/chat/${conversationId}`,
} as const;
