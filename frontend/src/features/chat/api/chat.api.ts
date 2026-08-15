import { api } from '@/shared/api/axios';
import type { ConversationResponse } from '@/features/chat/types/conversation/create-get-conversation.response';
import type { ConversationListResponse } from '@/features/chat/types/conversation/conversation-list.response';
import type { MessageListResponse } from '@/features/chat/types/message/message-list.response';
import type { DeleteConversationResponse } from '@/features/chat/types/conversation/delete-conversation.response.ts';

const CHAT_API_PREFIX = '/chat';

export const chatApi = {
  createOrGetConversation: async (
    recipientId: string,
  ): Promise<ConversationResponse> => {
    const res = await api.post<ConversationResponse>(
      `${CHAT_API_PREFIX}/conversations/${recipientId}`,
    );

    return res.data;
  },

  deleteConversation: async (
    conversationId: string,
  ): Promise<DeleteConversationResponse> => {
    const res = await api.delete<ConversationListResponse>(
      `${CHAT_API_PREFIX}/conversations/${conversationId}`,
    );

    return res.data;
  },

  getUserConversations: async (
    limit?: number,
    cursor?: string,
  ): Promise<ConversationListResponse> => {
    const res = await api.get<ConversationListResponse>(
      `${CHAT_API_PREFIX}/conversations`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );

    return res.data;
  },

  getMessages: async (
    conversationId: string,
    limit?: number,
    cursor?: string,
  ): Promise<MessageListResponse> => {
    const res = await api.get<MessageListResponse>(
      `${CHAT_API_PREFIX}/conversations/${conversationId}/messages`,
      {
        params: {
          limit,
          cursor,
        },
      },
    );

    return res.data;
  },
};
