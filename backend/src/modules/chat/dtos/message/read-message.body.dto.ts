import { IsUUID } from 'class-validator';

export class ReadMessageDto {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  messageId: string;
}
