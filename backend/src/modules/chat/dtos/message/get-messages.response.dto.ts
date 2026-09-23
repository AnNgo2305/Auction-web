import { MessageResponseDto } from '@modules/chat/dtos/message/message.response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesResponseDto {
  @ApiProperty({
    description: 'List of messages',
    type: [MessageResponseDto],
  })
  messages!: MessageResponseDto[];

  @ApiProperty({
    description: 'Message ID used as the cursor for the next page',
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  nextCursor!: string | null;
}
