import type { MessageType } from '@/shared/types/message';

export interface MessageUser {
  userId: string;
  username: string;
}

export interface ReplyMessage {
  messageId: string;
  sender: MessageUser;
  type: MessageType;
  content?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}

export interface Message {
  messageId: string;
  conversationId: string;
  sender: MessageUser;
  recipientId?: string;
  type: MessageType;
  content?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  isRead: boolean;
  createdAt: string;
  replyToMessage?: ReplyMessage | null;
}

export interface MessageUpdatedEvent {
  message: Message;
}
