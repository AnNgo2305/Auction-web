export const watchlistKeys = {
  all: ['watchlist'] as const,

  myList: () => [...watchlistKeys.all, 'me'] as const,
} as const;
