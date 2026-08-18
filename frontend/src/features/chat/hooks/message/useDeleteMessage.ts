import type { Socket } from 'socket.io-client';
import React, { useCallback } from 'react';
import type { MessageDeletePayload } from '@/features/chat/socket/types/payload/message-delete.payload.ts';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant.ts';
import { useAuth } from '@/shared/contexts/AuthContext.tsx';

export function useDeleteMessage(socketRef: React.RefObject<Socket | null>) {
  const isAuthenticated = useAuth();

  return useCallback(
    (payload: MessageDeletePayload) => {
      const socket = socketRef.current;

      if (!socket?.connected || !isAuthenticated) {
        return;
      }

      socket.emit(CHAT_EVENTS.MESSAGE_DELETE, payload);
    },
    [socketRef],
  );
}
