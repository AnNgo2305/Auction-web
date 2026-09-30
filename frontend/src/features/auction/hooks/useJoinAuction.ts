import { useCallback } from 'react';
import type React from 'react';
import type { Socket } from 'socket.io-client';
import { AUCTION_EVENTS } from '@/features/auction/constants/websocket-event.constant';
import type { AuctionJoinPayload } from '@/features/auction/socket/payload/auction-participant.payload';

export function useJoinAuction(
  socketRef: React.RefObject<Socket | null>,
  auctionId: string,
) {
  const handleJoinAuction = useCallback(() => {
    if (!socketRef.current?.connected || !auctionId) {
      return;
    }

    const payload: AuctionJoinPayload = {
      auctionId,
    };

    socketRef.current.emit(AUCTION_EVENTS.AUCTION_JOIN, payload);
  }, [auctionId, socketRef]);

  return {
    handleJoinAuction,
  };
}
