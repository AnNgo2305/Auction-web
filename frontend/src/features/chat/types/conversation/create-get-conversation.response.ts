import type { ApiResponse } from '@/shared/types/response.ts';
import type { MessageType } from '@/shared/types/message.ts';

export class ConversationData {
  conversationId!: string;

  initiator!: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };

  recipient!: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };

  lastMessage!: {
    messageId: string;
    content: string | null;
    type: MessageType;
    senderId: string;
    createdAt: string;
  } | null;

  isDeleted!: boolean;
}

export type ConversationResponse = ApiResponse<ConversationData>;
