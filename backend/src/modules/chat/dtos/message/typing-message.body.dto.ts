import { IsUUID } from 'class-validator';

export class TypingMessageBodyDto {
  @IsUUID()
  conversationId: string;
}
