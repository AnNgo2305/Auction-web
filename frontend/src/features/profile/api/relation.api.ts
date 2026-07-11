import { api } from '@/shared/api/axios';
import type { FollowSellerResponse } from '@/features/profile/types/relationship/follow-seller.response';
import type { UnfollowSellerResponse } from '@/features/profile/types/relationship/unfollow-seller.response';
import type { AcceptFollowResponse } from '@/features/profile/types/relationship/accept-follow.response';
import type { BlockBidderResponse } from '@/features/profile/types/relationship/block-bidder.response';
import type { DeclineFollowResponse } from '@/features/profile/types/relationship/decline-follow.response';
import type { UnblockBidderResponse } from '@/features/profile/types/relationship/unblock-bidder.response';
import type { GetFollowersResponse } from '@/features/profile/types/relationship/get-followers.response';
import type {
  GetPendingFollowRequestsResponse
} from '@/features/profile/types/relationship/get-pending-follow-requests.response';
import type { GetBlockedUsersResponse } from '@/features/profile/types/relationship/get-blocked-users.response';
import type {
  CancelFollowRequestResponse
} from '@/features/profile/types/relationship/cancel-follow-request.response';
import type { GetFollowingsResponse } from '@/features/profile/types/relationship/get-following.response';

const FOLLOW_API_PREFIX = '/follows';

export const relationApi = {
  followSeller: async (sellerId: string): Promise<FollowSellerResponse> => {
    const res = await api.post<FollowSellerResponse>(
      `${FOLLOW_API_PREFIX}/follow/${sellerId}`,
    );
    return res.data;
  },

  unfollowSeller: async (sellerId: string): Promise<UnfollowSellerResponse> => {
    const res = await api.post<UnfollowSellerResponse>(
      `${FOLLOW_API_PREFIX}/unfollow/${sellerId}`,
    );
    return res.data;
  },

  acceptFollow: async (bidderId: string): Promise<AcceptFollowResponse> => {
    const res = await api.post<AcceptFollowResponse>(
      `${FOLLOW_API_PREFIX}/accept/${bidderId}`,
    );
    return res.data;
  },

  cancelFollowRequest: async (
    sellerId: string,
  ): Promise<CancelFollowRequestResponse> => {
    const res = await api.post<CancelFollowRequestResponse>(
      `${FOLLOW_API_PREFIX}/cancel/${sellerId}`,
    );

    return res.data;
  },

  blockBidder: async (bidderId: string): Promise<BlockBidderResponse> => {
    const res = await api.post<BlockBidderResponse>(
      `${FOLLOW_API_PREFIX}/block/${bidderId}`,
    );
    return res.data;
  },

  declineFollow: async (bidderId: string): Promise<DeclineFollowResponse> => {
    const res = await api.post<DeclineFollowResponse>(
      `${FOLLOW_API_PREFIX}/decline/${bidderId}`,
    );
    return res.data;
  },

  unblockBidder: async (bidderId: string): Promise<UnblockBidderResponse> => {
    const res = await api.post<UnblockBidderResponse>(
      `${FOLLOW_API_PREFIX}/unblock/${bidderId}`,
    );
    return res.data;
  },

  getFollowers: async (
    sellerId: string,
    limit?: number,
    cursor?: string,
  ): Promise<GetFollowersResponse> => {
    const res = await api.get<GetFollowersResponse>(
      `${FOLLOW_API_PREFIX}/followers/${sellerId}`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );
    return res.data;
  },

  getPendingFollowRequests: async (
    limit?: number,
    cursor?: string,
  ): Promise<GetPendingFollowRequestsResponse> => {
    const res = await api.get<GetPendingFollowRequestsResponse>(
      `${FOLLOW_API_PREFIX}/pending`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );
    return res.data;
  },

  getBlockedUsers: async (
    limit?: number,
    cursor?: string,
  ): Promise<GetBlockedUsersResponse> => {
    const res = await api.get<GetBlockedUsersResponse>(
      `${FOLLOW_API_PREFIX}/blocked`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );
    return res.data;
  },

  getFollowings: async (
    bidderId: string,
    limit?: number,
    cursor?: string,
  ): Promise<GetFollowingsResponse> => {
    const res = await api.get<GetFollowingsResponse>(
      `${FOLLOW_API_PREFIX}/following/${bidderId}`,
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