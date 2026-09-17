import { api } from '@/shared/api/axios';
import type { AddToWatchlistResponse } from '@/features/watchlist/types/add-to-watchlist.response.ts';
import type { RemoveFromWatchlistResponse } from '@/features/watchlist/types/remove-from-watchlist.response.ts';
import type { GetMyWatchlistResponse } from '@/features/watchlist/types/get-my-watchlist.response.ts';

const WATCHLIST_API_PREFIX = '/watchlist';

export const watchlistApi = {
  addToWatchlist: async (
    auctionId: string,
  ): Promise<AddToWatchlistResponse> => {
    const res = await api.post<AddToWatchlistResponse>(
      `${WATCHLIST_API_PREFIX}/${auctionId}`,
    );

    return res.data;
  },

  removeFromWatchlist: async (
    auctionId: string,
  ): Promise<RemoveFromWatchlistResponse> => {
    const res = await api.delete<RemoveFromWatchlistResponse>(
      `${WATCHLIST_API_PREFIX}/${auctionId}`,
    );

    return res.data;
  },

  getMyWatchlist: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<GetMyWatchlistResponse> => {
    const res = await api.get<GetMyWatchlistResponse>(
      `${WATCHLIST_API_PREFIX}/me`,
      {
        params,
      },
    );

    return res.data;
  },
};
