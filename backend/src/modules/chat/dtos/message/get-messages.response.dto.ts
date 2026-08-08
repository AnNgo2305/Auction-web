import { MessageResponseDto } from '@modules/chat/dtos/message/message.response.dto';

export class GetMessagesResponseDto {
  messages!: MessageResponseDto[];

  nextCursor!: string | null;
}
