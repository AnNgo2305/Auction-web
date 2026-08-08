import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { MessageType } from '@generated/prisma/enums';

export class CreateMessageDto {
  @IsUUID('4', { message: 'Temp ID must be a valid UUID' })
  tempId!: string;

  @IsUUID('4', {
    message: 'Conversation ID must be a valid UUID',
  })
  conversationId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Reply message ID must be a valid UUID' })
  replyToMessageId?: string;

  @IsEnum(MessageType, { message: 'Invalid message type' })
  type!: MessageType;

  @IsOptional()
  @ValidateIf((o) => {
    const dto = o as CreateMessageDto;
    return dto.type === MessageType.TEXT;
  })
  @IsNotEmpty({ message: 'Content is required for text messages' })
  @IsString({ message: 'Content must be a string' })
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  content?: string;

  @IsOptional()
  @ValidateIf((o) => {
    const dto = o as CreateMessageDto;
    return dto.type === MessageType.IMAGE || dto.type === MessageType.FILE;
  })
  @IsNotEmpty({ message: 'File key is required' })
  @IsString({ message: 'File key must be a string' })
  @MaxLength(255, { message: 'File key must not exceed 255 characters' })
  fileKey?: string;

  @IsOptional()
  @ValidateIf((o) => {
    const dto = o as CreateMessageDto;
    return dto.type === MessageType.IMAGE || dto.type === MessageType.FILE;
  })
  @IsNotEmpty({ message: 'File name is required' })
  @IsString({ message: 'File name must be a string' })
  @MaxLength(255, { message: 'File name must not exceed 255 characters' })
  fileName?: string;

  @IsOptional()
  @ValidateIf((o) => {
    const dto = o as CreateMessageDto;
    return dto.type === MessageType.IMAGE || dto.type === MessageType.FILE;
  })
  @IsNotEmpty({ message: 'Mime type is required' })
  @IsString({ message: 'Mime type must be a string' })
  @MaxLength(100, { message: 'Mime type must not exceed 100 characters' })
  mimeType?: string;

  @IsOptional()
  @ValidateIf((o) => {
    const dto = o as CreateMessageDto;
    return dto.type === MessageType.IMAGE || dto.type === MessageType.FILE;
  })
  @IsInt({ message: 'File size must be an integer' })
  fileSize?: number;
}
