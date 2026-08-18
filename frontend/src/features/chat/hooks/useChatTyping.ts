import React, { useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { TypingPayload } from '@/features/chat/socket/types/payload/typing.payload.ts';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant.ts';

const TYPING_TIMEOUT = 1500;

const startTyping = (
  socketRef: React.RefObject<Socket | null>,
  payload: TypingPayload,
) => {
  socketRef.current?.emit(CHAT_EVENTS.TYPING_START, payload);
};

const stopTyping = (
  socketRef: React.RefObject<Socket | null>,
  payload: TypingPayload,
) => {
  socketRef.current?.emit(CHAT_EVENTS.TYPING_STOP, payload);
};

export function useChatTyping(
  socketRef: React.RefObject<Socket | null>,
  conversationId: string,
) {
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const handleStartTyping = useCallback(
    (content: string) => {
      if (!socketRef.current?.connected || !conversationId) return;

      // Input becomes epmty → stop typing immediately and clear the timer.
      if (!content.trim()) {
        if (isTyping.current) {
          stopTyping(socketRef, { conversationId });
          isTyping.current = false;
        }

        if (typingTimer.current) {
          clearTimeout(typingTimer.current);
          typingTimer.current = null;
        }

        return;
      }

      // First keystroke → emit TYPING_START only once.
      if (!isTyping.current) {
        isTyping.current = true;
        startTyping(socketRef, { conversationId });
      }

      // Each keystroke → reset the timer.
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }

      // No keystroke for 1.5s → automatically stop typing.
      typingTimer.current = setTimeout(() => {
        stopTyping(socketRef, { conversationId });
        isTyping.current = false;
        typingTimer.current = null;
      }, TYPING_TIMEOUT);
    },
    [conversationId, startTyping, stopTyping],
  );

  const handleStopTyping = useCallback(() => {
    if (!socketRef.current?.connected || !conversationId) return;

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }

    if (isTyping.current) {
      stopTyping(socketRef, { conversationId });
      isTyping.current = false;
    }
  }, [conversationId, stopTyping]);

  return {
    handleStartTyping,
    handleStopTyping,
  };
}
