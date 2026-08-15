import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsNotEmpty({ message: 'Message ID is required' })
  @IsString({ message: 'Message ID must be a string' })
  messageId!: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @MaxLength(5000, {
    message: 'Content must not exceed 5000 characters',
  })
  content!: string;

  @IsNotEmpty({ message: 'Conversation ID is required' })
  @IsString({ message: 'Conversation ID must be a string' })
  conversationId!: string;
}
