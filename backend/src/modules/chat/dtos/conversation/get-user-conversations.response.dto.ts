import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@generated/prisma/enums';

export class ConversationCursor {
  @ApiProperty({
    description: 'Timestamp of the last message used as the pagination cursor',
    example: '2026-09-23T08:00:00.000Z',
  })
  lastMessageAt!: string;

  @ApiProperty({
    description: 'Conversation ID used as the pagination cursor',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  conversationId!: string;
}

export class GetConversationsResponseDto {
  @ApiProperty({
    description: 'List of user conversations',
    type: 'array',
    example: [
      {
        conversationId: '550e8400-e29b-41d4-a716-446655440001',
        otherUser: {
          userId: '550e8400-e29b-41d4-a716-446655440002',
          username: 'jane_doe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
        lastMessage: {
          messageId: '550e8400-e29b-41d4-a716-446655440003',
          content: 'Hello, how are you?',
          type: 'TEXT',
          senderId: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2026-09-23T08:00:00.000Z',
        },
        unreadCount: 2,
      },
    ],
  })
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

  @ApiProperty({
    description: 'Cursor for the next page',
    type: ConversationCursor,
    nullable: true,
    example: {
      lastMessageAt: '2026-09-23T08:00:00.000Z',
      conversationId: '550e8400-e29b-41d4-a716-446655440001',
    },
  })
  nextCursor!: ConversationCursor | null;
}
