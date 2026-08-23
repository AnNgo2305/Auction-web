import { MessageData } from '@/features/chat/types/message/message.ts';

export interface MessageEvent {
  tempId: string;
  message: MessageData;
}
