import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '@generated/prisma/enums';

export class MessageUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username!: string;

  @ApiProperty({
    description: 'Profile image URL',
    nullable: true,
    example: 'https://example.com/profile.jpg',
  })
  profileImageUrl!: string | null;
}

export class ReplyMessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  messageId!: string;

  @ApiProperty({
    description: 'User who sent the message',
    type: MessageUserResponseDto,
  })
  sender!: MessageUserResponseDto;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type!: MessageType;

  @ApiPropertyOptional({
    description: 'Text content of the message',
    nullable: true,
    example: 'Hello!',
  })
  content?: string | null;

  @ApiPropertyOptional({
    description: 'Storage key of the attached file',
    nullable: true,
    example: 'chat/550e8400/message/image.jpg',
  })
  fileKey?: string | null;

  @ApiPropertyOptional({
    description: 'Original file name',
    nullable: true,
    example: 'image.jpg',
  })
  fileName?: string | null;

  @ApiPropertyOptional({
    description: 'MIME type of the attached file',
    nullable: true,
    example: 'image/jpeg',
  })
  mimeType?: string | null;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    nullable: true,
    example: 102400,
  })
  fileSize?: number | null;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  messageId!: string;

  @ApiProperty({
    description: 'Conversation ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  conversationId!: string;

  @ApiProperty({
    description: 'User who sent the message',
    type: MessageUserResponseDto,
  })
  sender!: MessageUserResponseDto;

  @ApiPropertyOptional({
    description: 'Recipient user ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  recipientId?: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type!: MessageType;

  @ApiPropertyOptional({
    description: 'Text content of the message',
    nullable: true,
    example: 'Hello, how are you?',
  })
  content?: string | null;

  @ApiPropertyOptional({
    description: 'Storage key of the attached file',
    nullable: true,
    example: 'chat/550e8400/message/image.jpg',
  })
  fileKey?: string | null;

  @ApiPropertyOptional({
    description: 'Original file name',
    nullable: true,
    example: 'image.jpg',
  })
  fileName?: string | null;

  @ApiPropertyOptional({
    description: 'MIME type of the attached file',
    nullable: true,
    example: 'image/jpeg',
  })
  mimeType?: string | null;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    nullable: true,
    example: 102400,
  })
  fileSize?: number | null;

  @ApiProperty({
    description: 'Timestamp when the message was read',
    nullable: true,
    example: '2026-09-23T08:05:00.000Z',
  })
  readAt!: Date | null;

  @ApiProperty({
    description: 'Whether the message has been read',
    example: true,
  })
  isRead!: boolean;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2026-09-23T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Message being replied to',
    type: ReplyMessageResponseDto,
    nullable: true,
  })
  replyToMessage?: ReplyMessageResponseDto | null;
}
