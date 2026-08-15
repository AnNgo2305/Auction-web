import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant';
import type { MessageUpdatePayload } from '@/features/chat/socket/types/payload/message-update.payload.ts';
import type { MessageDeletePayload } from '@/features/chat/socket/types/payload/message-delete.payload.ts';
import type { TypingPayload } from '@/features/chat/socket/types/payload/typing.payload.ts';
import type { MessageSendPayload } from '@/features/chat/socket/types/payload/message-send.payload.ts';
import type { MessageReadPayload } from '@/features/chat/socket/types/payload/message-read.payload.ts';
import type { MessageDeletedEvent } from '@/features/chat/socket/types/event/message-deleted.event.ts';
import type { MessageUpdatedEvent } from '@/features/chat/socket/types/event/message-updated.event.ts';
import type { MessageNewEvent } from '@/features/chat/socket/types/event/message-new.event.ts';
import type { TypingEvent } from '@/features/chat/socket/types/event/typing.event.ts';
import type { MessageReadEvent } from '@/features/chat/socket/types/event/message-read.event.ts';
import type { MessageEvent } from '@/features/chat/socket/types/event/message.event.ts';
import type { ConversationUpdatedEvent } from '@/features/chat/socket/types/event/conversation-updated.event.ts';
import type { MessageErrorEvent } from '@/features/chat/socket/types/event/message-error.event.ts';

export function useChatSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_URL}/chat`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {

    });

    socket.on('disconnect', () => {

    });

    socket.on(CHAT_EVENTS.MESSAGE_NEW, ({ message }: MessageNewEvent) => {

    });

    socket.on(CHAT_EVENTS.MESSAGE_ACK, ({ tempId, message }: MessageEvent) => {

    });

    socket.on(CHAT_EVENTS.MESSAGE_ERROR, ({ tempId, message }: MessageErrorEvent) => {

    });

    socket.on(CHAT_EVENTS.MESSAGE_READ, ({ messageId, conversationId, readby }: MessageReadEvent) => {

    });

    socket.on(CHAT_EVENTS.TYPING_START, ({ userId, conversationId }: TypingEvent) => {

    });

    socket.on(CHAT_EVENTS.TYPING_STOP, ({ userId, conversationId }: TypingEvent) => {

    });

    socket.on(CHAT_EVENTS.MESSAGE_UPDATED, ({ message }: MessageUpdatedEvent) => {

    });

    socket.on(CHAT_EVENTS.MESSAGE_DELETED, ({ messageId, conversationId }: MessageDeletedEvent) => {},
    );

    socket.on(CHAT_EVENTS.CONVERSATION_UPDATED, ({ conversationId, updatedAt, lastMessage }: ConversationUpdatedEvent) => {

    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = (payload: MessageSendPayload) => {
    socketRef.current?.emit(CHAT_EVENTS.MESSAGE_SEND, payload);
  };

  const readMessage = (payload: MessageReadPayload) => {
    socketRef.current?.emit(CHAT_EVENTS.MESSAGE_READ, payload);
  };

  const startTyping = (payload: TypingPayload) => {
    socketRef.current?.emit(CHAT_EVENTS.TYPING_START, payload);
  };

  const stopTyping = (payload: TypingPayload) => {
    socketRef.current?.emit(CHAT_EVENTS.TYPING_STOP, payload);
  };

  const updateMessage = (payload: MessageUpdatePayload) => {
    socketRef.current?.emit(CHAT_EVENTS.MESSAGE_UPDATE, payload);
  };

  const deleteMessage = (payload: MessageDeletePayload) => {
    socketRef.current?.emit(CHAT_EVENTS.MESSAGE_DELETE, payload);
  };

  return {
    socketRef,
    sendMessage,
    readMessage,
    startTyping,
    stopTyping,
    updateMessage,
    deleteMessage,
  };
}
