import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { CHAT_EVENTS } from '@/features/chat/socket/chat-socket.constant';
import type { MessageDeletedEvent } from '@/features/chat/socket/types/event/message-deleted.event.ts';
import type { MessageUpdatedEvent } from '@/features/chat/socket/types/event/message-updated.event.ts';
import type { MessageNewEvent } from '@/features/chat/socket/types/event/message-new.event.ts';
import type { TypingEvent } from '@/features/chat/socket/types/event/typing.event.ts';
import type { MessageReadEvent } from '@/features/chat/socket/types/event/message-read.event.ts';
import type { MessageEvent } from '@/features/chat/socket/types/event/message.event.ts';
import {
  type MessageErrorEvent,
  MessageErrorType,
} from '@/features/chat/socket/types/event/message-error.event.ts';
import { useChatStore } from '@/shared/stores/chat.store';
import { useAuth } from '@/shared/contexts/AuthContext.tsx';
import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { conversationKeys } from '@/features/chat/constants/conversation-query-key.ts';
import { messageKeys } from '../constants/message-query-key';
import type { MessageListResponse } from '@/features/chat/types/message/message-list.response.ts';
import type { ConversationListResponse } from '@/features/chat/types/conversation/conversation-list.response.ts';
import { toast } from 'sonner';
import { refreshAccessToken } from '@/shared/api/auth-session';
import { emitLogoutEvent } from '@/shared/api/auth-event';

type MessagesCache = InfiniteData<MessageListResponse>;
type ConversationsCache = InfiniteData<ConversationListResponse>;

export function useChatSocket() {
  const socketRef = useRef<Socket | null>(null);
  const isAuthenticated = useAuth();
  const queryClient = useQueryClient();

  const {
    activeConversationId,
    clearPeerTyping,
    setPeerTyping,
    updatePeerReadAt,
    setActiveConversation,
    clearAllPeerReadAt,
    clearAllTyping,
  } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (socketRef.current?.connected) return;

    const socket = io(`${import.meta.env.VITE_API_URL}/chat`, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', async () => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.list(),
      });
      const activeId = activeConversationId;
      if (activeId) {
        await queryClient.invalidateQueries({
          queryKey: messageKeys.list(activeId),
        });
      }
    });

    socket.on('disconnect', () => {
      clearAllTyping();
    });

    socket.on(
      CHAT_EVENTS.MESSAGE_NEW,
      ({ message: newMessage }: MessageNewEvent) => {
        queryClient.setQueryData<MessagesCache>(
          messageKeys.list(newMessage.conversationId),
          (currentCache) => {
            if (!currentCache) return currentCache;

            const alreadyExists = currentCache.pages.some((page) =>
              page.data.messages.some(
                (currentMessage) =>
                  currentMessage.messageId === newMessage.messageId,
              ),
            );

            if (alreadyExists) return currentCache;
            const [firstPage, ...remainingPages] = currentCache.pages;

            if (!firstPage) return currentCache;
            return {
              ...currentCache,
              pages: [
                {
                  ...firstPage,
                  data: {
                    ...firstPage.data,
                    messages: [newMessage, ...firstPage.data.messages],
                  },
                },
                ...remainingPages,
              ],
            };
          },
        );

        queryClient.setQueryData<ConversationsCache>(
          conversationKeys.list(),
          (currentCache) => {
            if (!currentCache) return currentCache;

            const isViewingConversation =
              activeConversationId === newMessage.conversationId &&
              typeof document !== 'undefined' &&
              document.visibilityState === 'visible';

            return {
              ...currentCache,
              pages: currentCache.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  conversations: page.data.conversations.map((conversation) => {
                    if (
                      conversation.conversationId !== newMessage.conversationId
                    ) {
                      return conversation;
                    }

                    return {
                      ...conversation,
                      lastMessage: {
                        messageId: newMessage.messageId,
                        content: newMessage.content ?? null,
                        type: newMessage.type,
                        senderId: newMessage.sender.userId,
                        createdAt: newMessage.createdAt,
                      },
                      unreadCount: isViewingConversation
                        ? conversation.unreadCount
                        : conversation.unreadCount + 1,
                    };
                  }),
                },
              })),
            };
          },
        );
      },
    );

    socket.on(
      CHAT_EVENTS.MESSAGE_ACK,
      ({ tempId, message: confirmedMessage }: MessageEvent) => {
        queryClient.setQueryData<MessagesCache>(
          messageKeys.list(confirmedMessage.conversationId),
          (currentCache) => {
            if (!currentCache) return currentCache;
            return {
              ...currentCache,
              pages: currentCache.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  messages: page.data.messages.map((currentMessage) =>
                    currentMessage.messageId === tempId
                      ? {
                          ...confirmedMessage,
                          _pending: false,
                        }
                      : currentMessage,
                  ),
                },
              })),
            };
          },
        );

        queryClient.setQueryData<ConversationsCache>(
          conversationKeys.list(),
          (currentCache) => {
            if (!currentCache) return currentCache;

            return {
              ...currentCache,
              pages: currentCache.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  conversations: page.data.conversations.map((conversation) => {
                    if (
                      conversation.conversationId !==
                      confirmedMessage.conversationId
                    ) {
                      return conversation;
                    }

                    return {
                      ...conversation,
                      lastMessage: {
                        messageId: confirmedMessage.messageId,
                        content: confirmedMessage.content ?? null,
                        type: confirmedMessage.type,
                        senderId: confirmedMessage.sender.userId,
                        createdAt: confirmedMessage.createdAt,
                      },
                    };
                  }),
                },
              })),
            };
          },
        );
      },
    );

    socket.on(
      CHAT_EVENTS.MESSAGE_ERROR,
      ({ type, tempId, conversationId, message }: MessageErrorEvent) => {
        switch (type) {
          case MessageErrorType.SEND:
            if (!tempId) break;
            queryClient.setQueryData<MessagesCache>(
              messageKeys.list(conversationId),
              (currentCache) => {
                if (!currentCache) return currentCache;
                return {
                  ...currentCache,
                  pages: currentCache.pages.map((page) => ({
                    ...page,
                    data: {
                      ...page.data,
                      messages: page.data.messages.map((message) =>
                        message.messageId === tempId
                          ? {
                              ...message,
                              _pending: false,
                              _failed: true,
                            }
                          : message,
                      ),
                    },
                  })),
                };
              },
            );
            break;

          case MessageErrorType.UPDATE:
          case MessageErrorType.DELETE: {
            void queryClient.invalidateQueries({
              queryKey: messageKeys.list(conversationId),
            });
            break;
          }
        }
        if (message) {
          toast.error(message);
        }
      },
    );

    socket.on(
      CHAT_EVENTS.MESSAGE_SEEN,
      ({ conversationId, readby, readAt }: MessageReadEvent) => {
        updatePeerReadAt(conversationId, readby, readAt);
      },
    );

    socket.on(
      CHAT_EVENTS.TYPING_START,
      ({ userId, conversationId }: TypingEvent) => {
        setPeerTyping(conversationId, userId);
      },
    );

    socket.on(
      CHAT_EVENTS.TYPING_STOP,
      ({ userId, conversationId }: TypingEvent) => {
        clearPeerTyping(conversationId, userId);
      },
    );

    socket.on(
      CHAT_EVENTS.MESSAGE_UPDATED,
      ({ message: updatedMessage }: MessageUpdatedEvent) => {
        queryClient.setQueryData<MessagesCache>(
          messageKeys.list(updatedMessage.conversationId),
          (currentCache) => {
            if (!currentCache) return currentCache;

            return {
              ...currentCache,
              pages: currentCache.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  messages: page.data.messages.map((currentMessage) =>
                    currentMessage.messageId === updatedMessage.messageId
                      ? {
                          ...updatedMessage,
                          _edited: true,
                        }
                      : currentMessage,
                  ),
                },
              })),
            };
          },
        );

        queryClient.setQueryData<ConversationsCache>(
          conversationKeys.list(),
          (currentCache) => {
            if (!currentCache) return currentCache;
            return {
              ...currentCache,
              pages: currentCache.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  conversations: page.data.conversations.map((conversation) => {
                    if (
                      conversation.conversationId !==
                      updatedMessage.conversationId
                    ) {
                      return conversation;
                    }

                    if (
                      conversation.lastMessage?.messageId !==
                      updatedMessage.messageId
                    ) {
                      return conversation;
                    }

                    return {
                      ...conversation,
                      lastMessage: {
                        messageId: updatedMessage.messageId,
                        content: updatedMessage.content ?? null,
                        type: updatedMessage.type,
                        senderId: updatedMessage.sender.userId,
                        createdAt: updatedMessage.createdAt,
                      },
                    };
                  }),
                },
              })),
            };
          },
        );
      },
    );

    socket.on(
      CHAT_EVENTS.MESSAGE_DELETED,
      async ({ conversationId }: MessageDeletedEvent) => {
        await queryClient.invalidateQueries({
          queryKey: messageKeys.list(conversationId),
        });

        await queryClient.invalidateQueries({
          queryKey: conversationKeys.list(),
        });
      },
    );

    socket.on(CHAT_EVENTS.CONVERSATION_UPDATED, async () => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.list(),
      });
    });

    socket.on(CHAT_EVENTS.EXCEPTION, async ({ errorCode }) => {
      if (errorCode !== 'ACCESS_TOKEN_EXPIRED') {
        socket.disconnect();
        socketRef.current = null;
        emitLogoutEvent();
        return;
      }

      try {
        await refreshAccessToken();
        socket.connect();
      } catch {
        emitLogoutEvent();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      clearAllTyping();
      clearAllPeerReadAt();
      setActiveConversation(null);
    };
  }, [isAuthenticated, queryClient]);

  return socketRef;
}
