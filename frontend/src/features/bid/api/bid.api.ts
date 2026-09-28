import { api } from '@/shared/api/axios';
import type { GetMyBidsResponse } from '@/features/bid/types/get-my-bids.response';
import type { GetAuctionBidsResponse } from '@/features/bid/types/get-auction-bids.response';

const BID_API_PREFIX = '/bids';

export const bidApi = {
  getMyBids: async (
    limit?: number,
    cursor?: string,
  ): Promise<GetMyBidsResponse> => {
    const res = await api.get<GetMyBidsResponse>(`${BID_API_PREFIX}/me`, {
      params: {
        limit,
        cursor,
      },
    });

    return res.data;
  },

  getBidsByAuction: async (
    auctionId: string,
    limit?: number,
    cursor?: string,
  ): Promise<GetAuctionBidsResponse> => {
    const res = await api.get<GetAuctionBidsResponse>(
      `${BID_API_PREFIX}/auction/${auctionId}`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );

    return res.data;
  },
};
