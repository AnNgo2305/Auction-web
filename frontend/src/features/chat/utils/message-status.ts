import type { MessageData } from '@/features/chat/types/message/message';

export type MessageStatus =
  | 'pending'
  | 'failed'
  | 'sent'
  | 'delivered'
  | 'seen';

export const STATUS_LABEL: Record<MessageStatus, string> = {
  pending: 'Sending…',
  failed: 'Failed to send',
  sent: 'Sent',
  delivered: 'Delivered',
  seen: 'Seen',
};

type MessageWithStatus = MessageData & {
  _failed?: boolean;
};

type MessageStatusParams = {
  message: MessageWithStatus;
  peerLastReadAt: string | null;
  isPeerOnline: boolean;
};

export function computeMessageStatus({
  message,
  peerLastReadAt,
  isPeerOnline,
}: MessageStatusParams): MessageStatus {
  if (message._failed) {
    return 'failed';
  }

  if (message._pending) {
    return 'pending';
  }

  const messageCreatedAt = new Date(message.createdAt).getTime();
  const peerReadAt = peerLastReadAt ? new Date(peerLastReadAt).getTime() : null;

  if (peerReadAt !== null && peerReadAt >= messageCreatedAt) {
    return 'seen';
  }

  return isPeerOnline ? 'delivered' : 'sent';
}
