import type { MessageType } from '@generated/prisma/enums';

export class ConversationResponseDto {
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
    createdAt: Date;
  } | null;
}
