import type { MessageType } from '@/shared/types/message.ts';

export interface ConversationUpdatedEvent {
  conversationId: string;

  lastMessage: {
    messageId: string;
    content: string | null;
    type: MessageType;
    senderId: string;
    senderName: string;
    createdAt: string;
  };

  updatedAt: string;
}
