export const bidKeys = {
  all: ['bids'] as const,

  auction: (auctionId: string) =>
    [...bidKeys.all, 'auction', auctionId] as const,

  mine: () => [...bidKeys.all, 'mine'] as const,
};
