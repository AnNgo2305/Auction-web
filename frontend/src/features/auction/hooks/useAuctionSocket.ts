import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { AUCTION_EVENTS } from '@/features/auction/constants/websocket-event.constant';
import { auctionKeys } from '@/features/auction/constants/auction-query-key';
import type { AuctionStartedEvent } from '@/features/auction/socket/types/event/auction-started.event';
import type { AuctionExtendedEvent } from '@/features/auction/socket/types/event/auction-extended.event';
import type { AuctionReopenedEvent } from '@/features/auction/socket/types/event/auction-reopened.event';
import type { AuctionCompletedEvent } from '@/features/auction/socket/types/event/auction-completed.event';
import type { AuctionClosedEvent } from '@/features/auction/socket/types/event/auction-closed.event';

type UseAuctionSocketOptions = {
  auctionIds: string[];
};

export function useAuctionSocket({ auctionIds }: UseAuctionSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (socketRef.current?.connected) return;

    const socket = io(`${import.meta.env.VITE_API_URL}/auctions`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const invalidateAuctionList = () => {
      void queryClient.invalidateQueries({
        queryKey: auctionKeys.list(),
      });
    };

    socket.on('connect', () => {
      auctionIds.forEach((auctionId) => {
        socket.emit(AUCTION_EVENTS.AUCTION_JOIN, auctionId);
      });

      invalidateAuctionList();
    });

    socket.on('disconnect', () => {
      // Không cần xử lý gì ở đây.
      // Khi reconnect, connect handler sẽ join lại các auction.
    });

    socket.on(AUCTION_EVENTS.AUCTION_STARTED, (_event: AuctionStartedEvent) => {
      invalidateAuctionList();
    });

    socket.on(
      AUCTION_EVENTS.AUCTION_EXTENDED,
      (_event: AuctionExtendedEvent) => {
        invalidateAuctionList();
      },
    );

    socket.on(
      AUCTION_EVENTS.AUCTION_COMPLETED,
      (_event: AuctionCompletedEvent) => {
        invalidateAuctionList();
      },
    );

    socket.on(AUCTION_EVENTS.AUCTION_CLOSED, (_event: AuctionClosedEvent) => {
      invalidateAuctionList();
    });

    socket.on(
      AUCTION_EVENTS.AUCTION_REOPENED,
      (_event: AuctionReopenedEvent) => {
        invalidateAuctionList();
      },
    );

    return () => {
      auctionIds.forEach((auctionId) => {
        socket.emit(AUCTION_EVENTS.AUCTION_LEAVE, auctionId);
      });

      socket.disconnect();
      socketRef.current = null;
    };
  }, [auctionIds, isAuthenticated, queryClient]);

  return socketRef;
}
