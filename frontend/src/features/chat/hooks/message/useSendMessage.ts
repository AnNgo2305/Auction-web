import type { Socket } from 'socket.io-client';
import React, { useCallback } from 'react';
import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import type { MessageListResponse } from '@/features/chat/types/message/message-list.response.ts';
import type { MessageData } from '@/features/chat/types/message/message.ts';
import type { MessageSendPayload } from '@/features/chat/socket/types/payload/message-send.payload.ts';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant.ts';
import { useUser } from '@/shared/contexts/UserContext.tsx';
import { messageKeys } from '@/features/chat/constants/message-query-key.ts';

type MessagesCache = InfiniteData<MessageListResponse>;

export function useSendMessage(socketRef: React.RefObject<Socket | null>) {
  const queryClient = useQueryClient();
  const { currentUser, isAuthenticated } = useUser();

  return useCallback(
    (
      conversationId: string,
      content: string,
      options?: {
        type?: MessageData['type'];
        fileKey?: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
        replyToMessageId?: string;
      },
    ) => {
      const socket = socketRef.current;
      if (!socket?.connected || !isAuthenticated || !currentUser) {
        return;
      }

      const tempId = crypto.randomUUID();
      const payload: MessageSendPayload = {
        tempId,
        conversationId,
        content,
        type: options?.type ?? 'TEXT',
        fileKey: options?.fileKey,
        fileName: options?.fileName,
        mimeType: options?.mimeType,
        fileSize: options?.fileSize,
        replyToMessageId: options?.replyToMessageId,
      };

      const repliedMessage = payload.replyToMessageId
        ? queryClient
            .getQueryData<MessagesCache>(messageKeys.list(conversationId))
            ?.pages.flatMap((page) => page.data.messages)
            .find((message) => message.messageId === payload.replyToMessageId)
        : undefined;

      const optimisticMessage: MessageData = {
        messageId: tempId,
        conversationId,
        sender: {
          userId: currentUser.userId,
          username: currentUser.username,
          profileImageUrl: currentUser.profileImageUrl ?? null,
        },
        type: payload.type,
        content: payload.content ?? null,
        fileKey: payload.fileKey ?? null,
        fileName: payload.fileName ?? null,
        mimeType: payload.mimeType ?? null,
        fileSize: payload.fileSize ?? null,
        replyToMessage: repliedMessage
          ? {
              messageId: repliedMessage.messageId,
              sender: repliedMessage.sender,
              type: repliedMessage.type,
              content: repliedMessage.content ?? null,
              fileKey: repliedMessage.fileKey ?? null,
              fileName: repliedMessage.fileName ?? null,
              mimeType: repliedMessage.mimeType ?? null,
              fileSize: repliedMessage.fileSize ?? null,
            }
          : null,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _pending: true,
      };

      queryClient.setQueryData<MessagesCache>(
        messageKeys.list(conversationId),
        (currentCache) => {
          if (!currentCache) return currentCache;
          const [firstPage, ...remainingPages] = currentCache.pages;
          if (!firstPage) return currentCache;

          return {
            ...currentCache,
            pages: [
              {
                ...firstPage,
                data: {
                  ...firstPage.data,
                  messages: [optimisticMessage, ...firstPage.data.messages],
                },
              },
              ...remainingPages,
            ],
          };
        },
      );

      socket.emit(CHAT_EVENTS.MESSAGE_SEND, payload);
    },
    [socketRef, queryClient, isAuthenticated, currentUser],
  );
}
