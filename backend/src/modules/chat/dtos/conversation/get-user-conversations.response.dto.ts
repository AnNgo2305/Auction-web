import type { MessageType } from '@generated/prisma/enums';

export class ConversationCursor {
  lastMessageAt!: string;
  conversationId!: string;
}

export class GetConversationsResponseDto {
  conversations!: {
    conversationId: string;

    otherUser: {
      userId: string;
      username: string;
      profileImageUrl: string | null;
    };

    lastMessage: {
      messageId: string;
      content: string | null;
      type: MessageType;
      senderId: string;
      createdAt: Date;
    } | null;

    unreadCount: number;
  }[];

  nextCursor!: ConversationCursor | null;
}
