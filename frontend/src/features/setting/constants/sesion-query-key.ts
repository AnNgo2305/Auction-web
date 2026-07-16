export const sessionKeys = {
  all: ['sessions'] as const,

  active: () => [...sessionKeys.all, 'active'] as const,
};
