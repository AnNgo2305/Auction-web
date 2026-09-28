import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bidKeys } from '@/features/bid/constants/bid-query-key';
import { BID_EVENTS } from '@/features/bid/constants/bid-socket.constant';
import type {
  AuctionBidData,
  GetAuctionBidsResponse,
} from '@/features/bid/types/get-auction-bids.response';
import type {
  GetMyBidsResponse,
  MyBidData,
} from '@/features/bid/types/get-my-bids.response';
import type { BidAckEvent } from '@/features/bid/socket/event/bid-ack.event.ts';
import type { BidErrorEvent } from '@/features/bid/socket/event/bid-error.event.ts';
import type { BidNewEvent } from '@/features/bid/socket/event/bid-new.event.ts';
import { useUser } from '@/shared/contexts/UserContext.tsx';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import type { GetAuctionByIdResponse } from '@/features/auction/types/get-auction-by-id.response';

type MyBidsCache = InfiniteData<GetMyBidsResponse>;
type AuctionBidsCache = InfiniteData<GetAuctionBidsResponse>;

export function useBidSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(`${import.meta.env.VITE_API_URL}/bid`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on(BID_EVENTS.BID_ACK, (event: BidAckEvent) => {
      const newBid: MyBidData = {
        bidId: event.bidId,
        auctionId: event.auctionId,
        auctionTitle: event.auctionTitle,
        bidAmount: event.bidAmount,
        createdAt: event.createdAt,
      };

      queryClient.setQueryData<MyBidsCache>(bidKeys.mine(), (currentCache) => {
        if (!currentCache) {
          return currentCache;
        }

        const [firstPage, ...remainingPages] = currentCache.pages;
        if (!firstPage) {
          return currentCache;
        }

        const alreadyExists = firstPage.data.bids.some(
          (bid) => bid.bidId === newBid.bidId,
        );

        if (alreadyExists) {
          return currentCache;
        }

        return {
          ...currentCache,
          pages: [
            {
              ...firstPage,
              data: {
                ...firstPage.data,
                bids: [newBid, ...firstPage.data.bids],
              },
            },
            ...remainingPages,
          ],
        };
      });

      toast.success('Bid placed successfully', {
        description: `Your bid of ${event.bidAmount.toLocaleString()} VND has been placed.`,
      });
    });

    socket.on(BID_EVENTS.BID_NEW, (event: BidNewEvent) => {
      const newBid: AuctionBidData = {
        bidId: event.bidId,
        username: event.username,
        profileImageUrl: event.profileImageUrl,
        bidAmount: event.bidAmount,
        createdAt: event.createdAt,
      };

      // Update auction bid history
      queryClient.setQueryData<AuctionBidsCache>(
        bidKeys.auction(event.auctionId),
        (currentCache) => {
          if (!currentCache) {
            return currentCache;
          }

          const [firstPage, ...remainingPages] = currentCache.pages;
          if (!firstPage) {
            return currentCache;
          }

          const alreadyExists = firstPage.data.bids.some(
            (bid) => bid.bidId === newBid.bidId,
          );

          if (alreadyExists) {
            return currentCache;
          }

          return {
            ...currentCache,
            pages: [
              {
                ...firstPage,
                data: {
                  ...firstPage.data,
                  bids: [newBid, ...firstPage.data.bids],
                },
              },
              ...remainingPages,
            ],
          };
        },
      );

      // Update auction detail
      queryClient.setQueryData<GetAuctionByIdResponse>(
        auctionKeys.detail(event.auctionId),
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            data: {
              ...currentData.data,
              currentPrice: event.bidAmount,
              bidCount: currentData.data.bidCount + 1,
            },
          };
        },
      );
    });

    socket.on(BID_EVENTS.BID_ERROR, (event: BidErrorEvent) => {
      toast.error('Bid failed', {
        description: `Your bid of ${event.bidAmount.toLocaleString()} VND was not accepted. ${event.message}`,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient]);

  return socketRef;
}
