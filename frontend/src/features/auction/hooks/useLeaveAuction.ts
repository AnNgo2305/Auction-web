import { useCallback } from 'react';
import type React from 'react';
import type { Socket } from 'socket.io-client';
import { AUCTION_EVENTS } from '@/features/auction/constants/websocket-event.constant';
import type { AuctionLeavePayload } from '@/features/auction/socket/payload/auction-participant.payload';

export function useLeaveAuction(
  socketRef: React.RefObject<Socket | null>,
  auctionId: string,
) {
  const handleLeaveAuction = useCallback(() => {
    if (!socketRef.current?.connected || !auctionId) {
      return;
    }

    const payload: AuctionLeavePayload = {
      auctionId,
    };

    socketRef.current.emit(AUCTION_EVENTS.AUCTION_LEAVE, payload);
  }, [auctionId, socketRef]);

  return {
    handleLeaveAuction,
  };
}
