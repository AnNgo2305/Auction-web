import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/features/chat/api/chat.api';
import { conversationKeys } from '@/features/chat/constants/conversation-query-key';
import {
  ConversationData,
  type ConversationResponse,
} from '@/features/chat/types/conversation/create-get-conversation.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useGetConversationById(conversationId: string | undefined) {
  return useQuery<ConversationResponse, ApiResponseError, ConversationData>({
    queryKey: conversationKeys.detail(conversationId ?? ''),
    queryFn: () => chatApi.getConversationById(conversationId!),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
    select: (response) => response.data,
  });
}
