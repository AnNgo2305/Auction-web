import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '@generated/prisma/enums';

export class ConversationResponseDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  conversationId!: string;

  @ApiProperty({
    description: 'Whether the conversation is deleted for the current user',
    example: false,
  })
  isDeleted!: boolean;

  @ApiProperty({
    description: 'User who initiated the conversation',
    example: {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      username: 'john_doe',
      profileImageUrl: 'https://example.com/john.jpg',
    },
  })
  initiator!: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };

  @ApiProperty({
    description: 'User who received the conversation request',
    example: {
      userId: '550e8400-e29b-41d4-a716-446655440002',
      username: 'jane_doe',
      profileImageUrl: null,
    },
  })
  recipient!: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };

  @ApiProperty({
    description: 'Last message in the conversation',
    nullable: true,
    example: {
      messageId: '550e8400-e29b-41d4-a716-446655440003',
      content: 'Hello!',
      type: MessageType.TEXT,
      senderId: '550e8400-e29b-41d4-a716-446655440002',
      createdAt: '2026-09-23T08:00:00.000Z',
    },
  })
  lastMessage!: {
    messageId: string;
    content: string | null;
    type: MessageType;
    senderId: string;
    createdAt: Date;
  } | null;
}
