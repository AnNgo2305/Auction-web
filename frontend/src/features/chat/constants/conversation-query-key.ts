export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
  detail: (conversationId: string) =>
    [...conversationKeys.all, 'detail', conversationId] as const,
  search: (query: string) =>
    [...conversationKeys.all, 'search', query] as const,
};
