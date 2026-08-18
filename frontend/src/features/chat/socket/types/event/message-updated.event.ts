import { MessageData } from '@/features/chat/types/message/message.ts';

export interface MessageUpdatedEvent {
  message: MessageData;
}
