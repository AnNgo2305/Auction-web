import { api } from '@/shared/api/axios';
import type { CreateAuctionBody } from '@/features/auction/schemas/create-auction.schema';
import type { UpdateAuctionBody } from '@/features/auction/schemas/update-auction.schema';
import type { SearchAuctionsQuery } from '@/features/auction/schemas/search-auctions.schema';
import type { CancelAuctionBody } from '@/features/auction/schemas/cancel-auction.schema';
import type { CreateAuctionResponse } from '@/features/auction/types/create-auction.response';
import type { SearchAuctionsResponse } from '@/features/auction/types/search-auctions.response';
import type { GetAuctionByIdResponse } from '@/features/auction/types/get-auction-by-id.response';
import type { GetMyAuctionsResponse } from '@/features/auction/types/get-my-auctions.response';
import type { UpdateAuctionResponse } from '@/features/auction/types/update-auction.response';
import type { CancelAuctionResponse } from '@/features/auction/types/cancel-auction.response';
import type { ResubmitAuctionResponse } from '@/features/auction/types/resubmit-auction.response';
import type { EndAuctionResponse } from '@/features/auction/types/end-auction.response';
import type { ConfirmAuctionResponse } from '@/features/auction/types/confirm-auction.response';
import type { GetMyAuctionsQuery } from '@/features/auction/schemas/get-my-auctions.schema.ts';

const AUCTION_API_PREFIX = '/auctions';

export const auctionApi = {
  createAuction: async (
    body: CreateAuctionBody,
  ): Promise<CreateAuctionResponse> => {
    const res = await api.post<CreateAuctionResponse>(AUCTION_API_PREFIX, body);

    return res.data;
  },

  searchAuctions: async (
    query: SearchAuctionsQuery,
  ): Promise<SearchAuctionsResponse> => {
    const res = await api.get<SearchAuctionsResponse>(AUCTION_API_PREFIX, {
      params: query,
    });

    return res.data;
  },

  getMyAuctions: async (
    query: GetMyAuctionsQuery,
  ): Promise<GetMyAuctionsResponse> => {
    const res = await api.get<GetMyAuctionsResponse>(
      `${AUCTION_API_PREFIX}/me`,
      {
        params: query,
      },
    );

    return res.data;
  },

  getAuctionById: async (
    auctionId: string,
  ): Promise<GetAuctionByIdResponse> => {
    const res = await api.get<GetAuctionByIdResponse>(
      `${AUCTION_API_PREFIX}/${auctionId}`,
    );

    return res.data;
  },

  updateAuction: async (
    auctionId: string,
    body: UpdateAuctionBody,
  ): Promise<UpdateAuctionResponse> => {
    const res = await api.put<UpdateAuctionResponse>(
      `${AUCTION_API_PREFIX}/${auctionId}`,
      body,
    );

    return res.data;
  },

  cancelAuction: async (
    auctionId: string,
    body: CancelAuctionBody,
  ): Promise<CancelAuctionResponse> => {
    const res = await api.patch<CancelAuctionResponse>(
      `${AUCTION_API_PREFIX}/${auctionId}/cancel`,
      body,
    );

    return res.data;
  },

  resubmitAuction: async (
    auctionId: string,
  ): Promise<ResubmitAuctionResponse> => {
    const res = await api.patch<ResubmitAuctionResponse>(
      `${AUCTION_API_PREFIX}/${auctionId}/resubmit`,
    );

    return res.data;
  },

  endAuction: async (auctionId: string): Promise<EndAuctionResponse> => {
    const res = await api.patch<EndAuctionResponse>(
      `${AUCTION_API_PREFIX}/${auctionId}/end`,
    );

    return res.data;
  },

  confirmAuction: async (
    auctionId: string,
  ): Promise<ConfirmAuctionResponse> => {
    const res = await api.patch<ConfirmAuctionResponse>(
      `${AUCTION_API_PREFIX}/${auctionId}/confirm`,
    );

    return res.data;
  },
};
