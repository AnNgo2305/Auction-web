import type { Socket } from 'socket.io-client';
import React, { useCallback } from 'react';
import type { MessageReadPayload } from '@/features/chat/socket/types/payload/message-read.payload.ts';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant.ts';
import { useUser } from '@/shared/contexts/UserContext.tsx';

export function useReadMessage(socketRef: React.RefObject<Socket | null>) {
  const { isAuthenticated } = useUser();

  return useCallback(
    (payload: MessageReadPayload) => {
      const socket = socketRef.current;

      if (!socket?.connected || !isAuthenticated) {
        return;
      }

      socket.emit(CHAT_EVENTS.MESSAGE_READ, payload);
    },
    [socketRef, isAuthenticated],
  );
}
