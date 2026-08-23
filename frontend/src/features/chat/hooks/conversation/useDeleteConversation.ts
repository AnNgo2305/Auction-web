import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApi } from '@/features/chat/api/chat.api';
import { conversationKeys } from '@/features/chat/constants/conversation-query-key';
import { DELETE_CONVERSATION_ERROR_MESSAGES } from '@/features/chat/constants/chat-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { DeleteConversationResponse } from '@/features/chat/types/conversation/delete-conversation.response.ts';

export function useDeleteConversation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<DeleteConversationResponse, ApiResponseError, string>({
    mutationFn: async (
      conversationId: string,
    ): Promise<DeleteConversationResponse> => {
      return await chatApi.deleteConversation(conversationId);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.list(),
      });

      toast.success(response.message);
      onSuccess?.();
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && DELETE_CONVERSATION_ERROR_MESSAGES[code]) ??
        DELETE_CONVERSATION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
