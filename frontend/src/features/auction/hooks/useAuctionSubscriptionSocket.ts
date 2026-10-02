import { useEffect, useRef } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getAuctionSocket } from '@/features/auction/socket/auction-socket';
import { AUCTION_EVENTS } from '@/features/auction/constants/websocket-event.constant';
import type { AuctionUpdatedEvent } from '@/features/auction/socket/event/auction-updated.event';
import type { SearchAuctionsResponse } from '@/features/auction/types/search-auctions.response';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';

type UseAuctionSubscriptionProps = {
  auctionIds: string[];
};

export function useAuctionSubscriptionSocket({ auctionIds }: UseAuctionSubscriptionProps) {
  const queryClient = useQueryClient();
  const previousAuctionIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const socket = getAuctionSocket();
    const previousAuctionIds = previousAuctionIdsRef.current;

    const subscribe = (ids: string[]) => {
      if (!socket.connected || ids.length === 0) {
        return;
      }

      socket.emit(AUCTION_EVENTS.AUCTION_SUBSCRIBE, {
        auctionIds: ids,
      });
    };

    const unsubscribe = (ids: string[]) => {
      if (!socket.connected || ids.length === 0) {
        return;
      }

      socket.emit(AUCTION_EVENTS.AUCTION_UNSUBSCRIBE, {
        auctionIds: ids,
      });
    };

    const previousIds = new Set(previousAuctionIds);
    const removedAuctionIds = previousAuctionIds.filter((id) => !auctionIds.includes(id));
    const addedAuctionIds = auctionIds.filter((id) => !previousIds.has(id));

    const handleConnect = () => {
      subscribe(auctionIds);
    };
    socket.on('connect', handleConnect);

    const handleAuctionUpdated = (event: AuctionUpdatedEvent) => {
      queryClient.setQueriesData<InfiniteData<SearchAuctionsResponse>>(
        { queryKey: auctionKeys.lists() },
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            pages: currentData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                data: page.data.data.map((auction) => {
                  if (auction.auctionId !== event.auctionId) {
                    return auction;
                  }

                  return {
                    ...auction,
                    ...(event.currentPrice !== undefined && {
                      currentPrice: event.currentPrice,
                    }),
                    ...(event.bidCount !== undefined && {
                      bidCount: event.bidCount,
                    }),
                    ...(event.status !== undefined && {
                      status: event.status,
                    }),
                    ...(event.endTime !== undefined && {
                      endTime: event.endTime,
                    }),
                  };
                }),
              },
            })),
          };
        },
      );
    }
    socket.on(AUCTION_EVENTS.AUCTION_UPDATED, handleAuctionUpdated);

    if (socket.connected) {
      unsubscribe(removedAuctionIds);
      subscribe(addedAuctionIds);
    }

    previousAuctionIdsRef.current = auctionIds;

    return () => {
      socket.off('connect', handleConnect);

      socket.off(AUCTION_EVENTS.AUCTION_UPDATED, handleAuctionUpdated);
    };
  }, [auctionIds, queryClient]);

  useEffect(() => {
    const socket = getAuctionSocket();

    return () => {
      const currentAuctionIds = previousAuctionIdsRef.current;

      if (!socket.connected || currentAuctionIds.length === 0) {
        return;
      }

      socket.emit(AUCTION_EVENTS.AUCTION_UNSUBSCRIBE, {
        auctionIds: currentAuctionIds,
      });

      previousAuctionIdsRef.current = [];
    };
  }, []);
}