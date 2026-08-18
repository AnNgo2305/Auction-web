export enum MessageErrorType {
  SEND = 'SEND',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface MessageErrorEvent {
  type: MessageErrorType;
  message: string;
  conversationId: string;
  tempId?: string;
}
