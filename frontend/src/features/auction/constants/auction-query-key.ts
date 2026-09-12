export const auctionKeys = {
  all: ['auctions'] as const,

  lists: () => [...auctionKeys.all, 'list'] as const,

  list: (query?: unknown) => [...auctionKeys.lists(), query] as const,

  myLists: () => [...auctionKeys.all, 'my-list'] as const,

  myList: (query?: unknown) => [...auctionKeys.myLists(), query] as const,

  details: () => [...auctionKeys.all, 'detail'] as const,

  detail: (auctionId: string) => [...auctionKeys.details(), auctionId] as const,
};
