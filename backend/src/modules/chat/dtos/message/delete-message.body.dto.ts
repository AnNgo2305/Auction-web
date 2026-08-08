import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteMessageDto {
  @IsNotEmpty({ message: 'Message ID is required' })
  @IsString({ message: 'Message ID must be a string' })
  messageId!: string;

  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsString({ message: 'Conversation ID must be a string' })
  conversationId!: string;
}
