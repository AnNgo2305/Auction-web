import type { MessageType } from '@generated/prisma/enums';

export class MessageUserResponseDto {
  userId!: string;
  username!: string;
  profileImageUrl!: string | null;
}

export class ReplyMessageResponseDto {
  messageId!: string;

  sender!: MessageUserResponseDto;

  type!: MessageType;

  content?: string | null;

  fileKey?: string | null;

  fileName?: string | null;

  mimeType?: string | null;

  fileSize?: number | null;
}

export class MessageResponseDto {
  messageId!: string;

  conversationId!: string;

  sender!: MessageUserResponseDto;

  recipientId?: string;

  type!: MessageType;

  content?: string | null;

  fileKey?: string | null;

  fileName?: string | null;

  mimeType?: string | null;

  fileSize?: number | null;

  readAt: Date | null;

  isRead!: boolean;

  createdAt!: Date;

  replyToMessage?: ReplyMessageResponseDto | null;
}
