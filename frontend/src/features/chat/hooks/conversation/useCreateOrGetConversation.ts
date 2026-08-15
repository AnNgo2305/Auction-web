import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApi } from '@/features/chat/api/chat.api';
import { conversationKeys } from '@/features/chat/constants/conversation-query-key';
import { CREATE_OR_GET_CONVERSATION_ERROR_MESSAGES } from '@/features/chat/constants/chat-error.messages';
import type { ConversationResponse } from '@/features/chat/types/conversation/create-get-conversation.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useCreateOrGetConversation(
  onSuccess?: (response: ConversationResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<ConversationResponse, ApiResponseError, string>({
    mutationFn: async (recipientId: string): Promise<ConversationResponse> => {
      return await chatApi.createOrGetConversation(recipientId);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.list(),
      });

      onSuccess?.(response);
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && CREATE_OR_GET_CONVERSATION_ERROR_MESSAGES[code]) ??
        CREATE_OR_GET_CONVERSATION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
