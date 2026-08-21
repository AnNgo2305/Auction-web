import type { MessageType } from '@/shared/types/message';

export class MessageUserData {
  userId!: string;
  username!: string;
  profileImageUrl!: string | null;
}

export class ReplyMessageData {
  messageId!: string;
  sender!: MessageUserData;
  type!: MessageType;
  content?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}

export class MessageData {
  messageId!: string;
  conversationId!: string;
  sender!: MessageUserData;
  recipientId?: string;
  type!: MessageType;
  content?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  isRead!: boolean;
  createdAt!: string;
  replyToMessage?: ReplyMessageData | null;

  _failed?: boolean;
  _pending?: boolean;
}
