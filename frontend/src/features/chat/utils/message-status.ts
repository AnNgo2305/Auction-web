import type { MessageData } from '@/features/chat/types/message/message';

export type MessageStatus =
  | 'pending'
  | 'failed'
  | 'sent'
  | 'delivered'
  | 'seen'
  | 'edited';

export const STATUS_LABEL: Record<MessageStatus, string> = {
  pending: 'Sending…',
  failed: 'Failed to send',
  sent: 'Sent',
  delivered: 'Delivered',
  seen: 'Seen',
  edited: 'Edited',
};

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

export type MessageStatusResult = {
  status: MessageStatus;
  time?: string;
  isEdited: boolean;
};

type MessageStatusParams = {
  message: MessageData;
  peerLastReadAt: string | null;
  isPeerOnline: boolean;
};

export function computeMessageStatus({
  message,
  peerLastReadAt,
  isPeerOnline,
}: MessageStatusParams): MessageStatusResult {
  const messageCreatedAt = new Date(message.createdAt).getTime();
  const messageUpdatedAt = new Date(message.updatedAt).getTime();

  const isEdited =
    message._edited === true || messageUpdatedAt > messageCreatedAt;

  if (message._failed) {
    return {
      status: 'failed',
      isEdited,
    };
  }

  if (message._pending) {
    return {
      status: 'pending',
      isEdited,
    };
  }

  if (peerLastReadAt) {
    const peerReadAt = new Date(peerLastReadAt).getTime();

    if (peerReadAt >= messageCreatedAt) {
      return {
        status: 'seen',
        time: formatTime(peerLastReadAt),
        isEdited,
      };
    }
  }

  if (message.readAt) {
    return {
      status: 'seen',
      time: formatTime(message.readAt),
      isEdited,
    };
  }

  return {
    status: isPeerOnline ? 'delivered' : 'sent',
    time: formatTime(message.createdAt),
    isEdited,
  };
}
