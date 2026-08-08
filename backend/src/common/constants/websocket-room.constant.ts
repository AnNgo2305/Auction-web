export const WS_ROOMS = {
  USER: (userId: string) => `user:${userId}`,
  CONVERSATION: (conversationId: string) => `conversation:${conversationId}`,
} as const;
