export const addressKeys = {
  all: ['addresses'] as const,

  detail: (userId: string) => [...addressKeys.all, userId] as const,
};
