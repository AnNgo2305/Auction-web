import { IsUUID } from 'class-validator';

export class ReadMessageDto {
  @IsUUID('7', {
    message: 'Conversation ID must be a valid UUID',
  })
  conversationId: string;

  @IsUUID('7', {
    message: 'Message ID must be a valid UUID',
  })
  messageId: string;
}
