import type { MessageType } from '@generated/prisma/enums';

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

  nextCursor!: string | null;
}
