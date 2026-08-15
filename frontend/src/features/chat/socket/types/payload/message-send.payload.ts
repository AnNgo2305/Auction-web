import type { MessageType } from '@/shared/types/message.ts';

export interface MessageSendPayload {
  tempId: string;
  conversationId: string;
  replyToMessageId?: string;
  type: MessageType;
  content?: string;
  fileKey?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}
