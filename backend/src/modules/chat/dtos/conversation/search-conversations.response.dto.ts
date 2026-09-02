export class SearchedConversations {
  conversationId!: string;
  userId!: string;
  username!: string;
  profileImageUrl!: string | null;
}

export class SearchConversationsResponseDto {
  conversations!: SearchedConversations[];
  nextCursor!: string | null;
}
