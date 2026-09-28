import { useCallback } from 'react';
import type React from 'react';
import type { Socket } from 'socket.io-client';
import { BID_EVENTS } from '@/features/bid/constants/bid-socket.constant';
import type { PlaceBidFormValues as CreateBidPayload } from '@/features/bid/socket/payload/place-bid.schema';

export function usePlaceBid(
  socketRef: React.RefObject<Socket | null>,
  auctionId: string,
) {
  const handlePlaceBid = useCallback(
    (bidAmount: number) => {
      if (!socketRef.current?.connected || !auctionId) {
        return;
      }

      const payload: CreateBidPayload = {
        auctionId,
        tempId: crypto.randomUUID(),
        bidAmount,
      };

      socketRef.current.emit(BID_EVENTS.BID_PLACE, payload);
    },
    [auctionId, socketRef],
  );

  return {
    handlePlaceBid,
  };
}
