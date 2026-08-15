import type { ApiResponse } from '@/shared/types/response.ts';
import type { MessageType } from '@/shared/types/message.ts';

export class ConversationUser {
  userId!: string;
  username!: string;
  profileImageUrl!: string | null;
}

export class LastMessage {
  messageId!: string;
  content!: string | null;
  type!: MessageType;
  senderId!: string;
  createdAt!: string;
}

export class ConversationItem {
  conversationId!: string;
  otherUser!: ConversationUser;
  lastMessage!: LastMessage | null;
  unreadCount!: number;
}

export class ConversationCursor {
  lastMessageAt!: string;
  conversationId!: string;
}

export class GetConversationsData {
  conversations!: ConversationItem[];
  nextCursor!: ConversationCursor | null;
}

export type ConversationListResponse = ApiResponse<GetConversationsData>;
