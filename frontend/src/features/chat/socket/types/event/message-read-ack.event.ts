export interface MessageReadAckEvent {
  conversationId: string;
  messageId: string;
  readAt: string;
  unreadCount: number;
}
