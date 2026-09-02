import { IsUUID } from 'class-validator';

export class TypingMessageBodyDto {
  @IsUUID('7', {
    message: 'Conversation ID must be a valid UUID',
  })
  conversationId: string;
}
