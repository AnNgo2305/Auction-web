import { ApiProperty } from '@nestjs/swagger';

export class SearchedConversations {
  @ApiProperty({
    description: 'Conversation ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  conversationId!: string;

  @ApiProperty({
    description: 'User ID of the other participant',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  userId!: string;

  @ApiProperty({
    description: 'Username of the other participant',
    example: 'jane_doe',
  })
  username!: string;

  @ApiProperty({
    description: 'Profile image URL of the other participant',
    nullable: true,
    example: 'https://example.com/profile.jpg',
  })
  profileImageUrl!: string | null;
}

export class SearchConversationsResponseDto {
  @ApiProperty({
    description: 'List of conversations matching the search query',
    type: [SearchedConversations],
  })
  conversations!: SearchedConversations[];

  @ApiProperty({
    description: 'Conversation ID used as the cursor for the next page',
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  nextCursor!: string | null;
}
