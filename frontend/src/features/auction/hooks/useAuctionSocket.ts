import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { AUCTION_EVENTS } from '@/features/auction/constants/websocket-event.constant';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import type { GetAuctionByIdResponse } from '@/features/auction/types/get-auction-by-id.response';
import type { AuctionBidder, BidderSnapshotEvent } from '@/features/auction/socket/event/bidder-snapshot.event';
import type { BidderLeftEvent } from '@/features/auction/socket/event/bidder-left.event.ts';
import type { BidderJoinedEvent } from '@/features/auction/socket/event/bidder-joined.event.ts';
import type { AuctionStartedEvent } from '@/features/auction/socket/event/auction-started.event.ts';
import type { AuctionExtendedEvent } from '@/features/auction/socket/event/auction-extended.event.ts';
import { AUCTION_STATUSES } from '@/shared/types/auction-status.ts';
import type { AuctionCompletedEvent } from '@/features/auction/socket/event/auction-completed.event.ts';
import type { AuctionClosedEvent } from '@/features/auction/socket/event/auction-closed.event.ts';
import type { AuctionReopenedEvent } from '@/features/auction/socket/event/auction-reopened.event.ts';
import type { AuctionWinnerEvent } from '@/features/auction/socket/event/auction-winner.event.ts';

export function useAuctionSocket(
  auctionId: string,
  onAuctionWinner?: (event: AuctionWinnerEvent) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [bidders, setBidders] = useState<AuctionBidder[]>([]);

  useEffect(() => {
    if (!auctionId) {
      return;
    }

    const socket = io(`${import.meta.env.VITE_API_URL}/auctions`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit(AUCTION_EVENTS.AUCTION_JOIN, auctionId);
    });

    socket.on(AUCTION_EVENTS.AUCTION_STARTED, (event: AuctionStartedEvent) => {
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
              status: AUCTION_STATUSES.OPEN,
              startTime: event.startTime ?? currentData.data.startTime,
              endTime: event.endTime ?? currentData.data.endTime,
            },
          };
        },
      );
    });

    socket.on(
      AUCTION_EVENTS.AUCTION_EXTENDED,
      (event: AuctionExtendedEvent) => {
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
                status: AUCTION_STATUSES.EXTENDED,
                endTime: event.endTime ?? currentData.data.endTime,
              },
            };
          },
        );
      },
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_COMPLETED,
      (event: AuctionCompletedEvent) => {
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
                status: AUCTION_STATUSES.COMPLETED,
              },
            };
          },
        );
      },
    );

    socket.on(AUCTION_EVENTS.AUCTION_CLOSED, (event: AuctionClosedEvent) => {
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
              status: AUCTION_STATUSES.CLOSED,
            },
          };
        },
      );
    });

    socket.on(
      AUCTION_EVENTS.AUCTION_REOPENED,
      (event: AuctionReopenedEvent) => {
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
                status: AUCTION_STATUSES.OPEN,
                startTime: event.startTime ?? currentData.data.startTime,
                endTime: event.endTime ?? currentData.data.endTime,
              },
            };
          },
        );
      },
    );

    socket.on(AUCTION_EVENTS.AUCTION_WINNER, (event: AuctionWinnerEvent) => {
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
              status: AUCTION_STATUSES.COMPLETED,
              winner: {
                userId: event.winnerId,
                username: event.username,
                bidAmount: event.bidAmount,
                profileImageUrl: event.profileImageUrl,
              },
            },
          };
        },
      );

      onAuctionWinner?.(event);
    });

    socket.on(AUCTION_EVENTS.BIDDER_SNAPSHOT, (event: BidderSnapshotEvent) => {
      setBidders(event.bidders);
    });

    socket.on(AUCTION_EVENTS.BIDDER_LEFT, (event: BidderLeftEvent) => {
      setBidders((currentBidders) =>
        currentBidders.filter((bidder) => bidder.userId !== event.userId),
      );
    });

    socket.on(AUCTION_EVENTS.BIDDER_JOINED, (event: BidderJoinedEvent) => {
      setBidders((currentBidders) => {
        const alreadyExists = currentBidders.some(
          (bidder) => bidder.userId === event.bidder.userId,
        );

        if (alreadyExists) {
          return currentBidders;
        }

        return [...currentBidders, event.bidder];
      });
    });

    return () => {
      socket.emit(AUCTION_EVENTS.AUCTION_LEAVE, auctionId);
      socket.disconnect();
      socketRef.current = null;
      setBidders([]);
    };
  }, [auctionId, onAuctionWinner, queryClient]);

  return {
    socketRef,
    bidders,
  };
}
