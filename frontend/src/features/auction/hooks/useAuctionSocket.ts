import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { AUCTION_EVENTS } from '@/features/auction/constants/websocket-event.constant';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import { getAuctionSocket } from '@/features/auction/socket/auction-socket';
import type { GetAuctionByIdResponse } from '@/features/auction/types/get-auction-by-id.response';
import type {
  AuctionBidder,
  BidderSnapshotEvent,
} from '@/features/auction/socket/event/bidder-snapshot.event';
import type { BidderLeftEvent } from '@/features/auction/socket/event/bidder-left.event';
import type { BidderJoinedEvent } from '@/features/auction/socket/event/bidder-joined.event';
import type { AuctionStartedEvent } from '@/features/auction/socket/event/auction-started.event';
import type { AuctionExtendedEvent } from '@/features/auction/socket/event/auction-extended.event';
import type { AuctionCompletedEvent } from '@/features/auction/socket/event/auction-completed.event';
import type { AuctionClosedEvent } from '@/features/auction/socket/event/auction-closed.event';
import type { AuctionReopenedEvent } from '@/features/auction/socket/event/auction-reopened.event';
import type { AuctionWinnerEvent } from '@/features/auction/socket/event/auction-winner.event';
import { AUCTION_STATUSES } from '@/shared/types/auction-status';

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

    const socket = getAuctionSocket();

    socketRef.current = socket;

    const updateAuctionDetail = (
      auctionId: string,
      updater: (
        currentData: GetAuctionByIdResponse,
      ) => GetAuctionByIdResponse,
    ) => {
      queryClient.setQueryData<GetAuctionByIdResponse>(
        auctionKeys.detail(auctionId),
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return updater(currentData);
        },
      );
    };

    const handleConnect = () => {
      socket.emit(AUCTION_EVENTS.AUCTION_JOIN, {
        auctionId,
      });
    };

    const handleAuctionStarted = (event: AuctionStartedEvent) => {
      updateAuctionDetail(event.auctionId, (currentData) => ({
        ...currentData,
        data: {
          ...currentData.data,
          status: AUCTION_STATUSES.OPEN,
          startTime:
            event.startTime ?? currentData.data.startTime,
          endTime: event.endTime ?? currentData.data.endTime,
        },
      }));
    };

    const handleAuctionExtended = (
      event: AuctionExtendedEvent,
    ) => {
      updateAuctionDetail(event.auctionId, (currentData) => ({
        ...currentData,
        data: {
          ...currentData.data,
          status: AUCTION_STATUSES.EXTENDED,
          endTime: event.endTime ?? currentData.data.endTime,
        },
      }));
    };

    const handleAuctionCompleted = (
      event: AuctionCompletedEvent,
    ) => {
      updateAuctionDetail(event.auctionId, (currentData) => ({
        ...currentData,
        data: {
          ...currentData.data,
          status: AUCTION_STATUSES.COMPLETED,
        },
      }));
    };

    const handleAuctionClosed = (event: AuctionClosedEvent) => {
      updateAuctionDetail(event.auctionId, (currentData) => ({
        ...currentData,
        data: {
          ...currentData.data,
          status: AUCTION_STATUSES.CLOSED,
        },
      }));
    };

    const handleAuctionReopened = (
      event: AuctionReopenedEvent,
    ) => {
      updateAuctionDetail(event.auctionId, (currentData) => ({
        ...currentData,
        data: {
          ...currentData.data,
          status: AUCTION_STATUSES.OPEN,
          startTime:
            event.startTime ?? currentData.data.startTime,
          endTime: event.endTime ?? currentData.data.endTime,
        },
      }));
    };

    const handleAuctionWinner = (
      event: AuctionWinnerEvent,
    ) => {
      updateAuctionDetail(event.auctionId, (currentData) => ({
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
      }));

      onAuctionWinner?.(event);
    };

    const handleBidderSnapshot = (
      event: BidderSnapshotEvent,
    ) => {
      setBidders(event.bidders);
    };

    const handleBidderLeft = (event: BidderLeftEvent) => {
      setBidders((currentBidders) =>
        currentBidders.filter(
          (bidder) => bidder.userId !== event.userId,
        ),
      );
    };

    const handleBidderJoined = (
      event: BidderJoinedEvent,
    ) => {
      setBidders((currentBidders) => {
        const alreadyExists = currentBidders.some(
          (bidder) => bidder.userId === event.bidder.userId,
        );

        if (alreadyExists) {
          return currentBidders;
        }

        return [...currentBidders, event.bidder];
      });
    };

    socket.on('connect', handleConnect);

    socket.on(
      AUCTION_EVENTS.AUCTION_STARTED,
      handleAuctionStarted,
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_EXTENDED,
      handleAuctionExtended,
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_COMPLETED,
      handleAuctionCompleted,
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_CLOSED,
      handleAuctionClosed,
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_REOPENED,
      handleAuctionReopened,
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_WINNER,
      handleAuctionWinner,
    );

    socket.on(
      AUCTION_EVENTS.BIDDER_SNAPSHOT,
      handleBidderSnapshot,
    );

    socket.on(
      AUCTION_EVENTS.BIDDER_LEFT,
      handleBidderLeft,
    );

    socket.on(
      AUCTION_EVENTS.BIDDER_JOINED,
      handleBidderJoined,
    );

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.emit(AUCTION_EVENTS.AUCTION_LEAVE, {
        auctionId,
      });

      socket.off('connect', handleConnect);

      socket.off(
        AUCTION_EVENTS.AUCTION_STARTED,
        handleAuctionStarted,
      );

      socket.off(
        AUCTION_EVENTS.AUCTION_EXTENDED,
        handleAuctionExtended,
      );

      socket.off(
        AUCTION_EVENTS.AUCTION_COMPLETED,
        handleAuctionCompleted,
      );

      socket.off(
        AUCTION_EVENTS.AUCTION_CLOSED,
        handleAuctionClosed,
      );

      socket.off(
        AUCTION_EVENTS.AUCTION_REOPENED,
        handleAuctionReopened,
      );

      socket.off(
        AUCTION_EVENTS.AUCTION_WINNER,
        handleAuctionWinner,
      );

      socket.off(
        AUCTION_EVENTS.BIDDER_SNAPSHOT,
        handleBidderSnapshot,
      );

      socket.off(
        AUCTION_EVENTS.BIDDER_LEFT,
        handleBidderLeft,
      );

      socket.off(
        AUCTION_EVENTS.BIDDER_JOINED,
        handleBidderJoined,
      );

      socketRef.current = null;
    };
  }, [auctionId, onAuctionWinner, queryClient]);

  return {
    socketRef,
    bidders,
  };
}
