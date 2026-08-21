export class SearchedConversations {
  conversationId!: string;
  username!: string;
  profileImageUrl!: string | null;
}

export class SearchConversationsResponseDto {
  users!: SearchedConversations[];
  nextCursor!: string | null;
}
