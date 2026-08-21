export type SearchConversationItem = {
  conversationId: string,
  username: string;
  profileImageUrl: string | null;
};

export type SearchConversationsResponse = {
  statusCode: number;
  message: string;
  data: {
    conversations: SearchConversationItem[];
    nextCursor: string | null;
  };
};
