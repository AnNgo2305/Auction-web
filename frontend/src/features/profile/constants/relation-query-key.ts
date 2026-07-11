export const relationKeys = {
  all: ['relation'] as const,

  followers: (sellerId: string) =>
    [...relationKeys.all, 'followers', sellerId] as const,

  followings: (bidderId?: string) =>
    [...relationKeys.all, 'followings', bidderId] as const,

  pendingRequests: () => [...relationKeys.all, 'pending-requests'] as const,

  sentRequests: () => [...relationKeys.all, 'sent-requests'] as const,

  blockedUsers: () => [...relationKeys.all, 'blocked-users'] as const,
};
