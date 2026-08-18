import type { Socket } from 'socket.io-client';
import React, { useCallback } from 'react';
import type { MessageUpdatePayload } from '@/features/chat/socket/types/payload/message-update.payload.ts';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant.ts';
import { useAuth } from '@/shared/contexts/AuthContext.tsx';

export function useUpdateMessage(socketRef: React.RefObject<Socket | null>) {
  const isAuthenticated = useAuth();

  return useCallback(
    (payload: MessageUpdatePayload) => {
      const socket = socketRef.current;

      if (!socket?.connected || !isAuthenticated) {
        return;
      }

      socket.emit(CHAT_EVENTS.MESSAGE_UPDATE, payload);
    },
    [socketRef],
  );
}
