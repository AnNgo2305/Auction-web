import { type Message } from './message-new.event'

export interface MessageEvent {
  tempId: string;
  message: Message;
}
