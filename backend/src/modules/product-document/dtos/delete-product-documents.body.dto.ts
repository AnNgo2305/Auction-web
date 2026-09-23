import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsUUID,
} from 'class-validator';

export class DeleteProductDocumentsDto {
  @ApiProperty({
    description: 'IDs of the product documents to delete',
    type: [String],
    minItems: 1,
    maxItems: 10,
    example: [
      '018f3c5e-7b3a-7abc-8def-1234567890ab',
      '018f3c5e-7b3a-7def-8abc-abcdef123456',
    ],
  })
  @IsArray({
    message: 'Document IDs must be an array.',
  })
  @ArrayMinSize(1, {
    message: 'At least one document ID is required.',
  })
  @ArrayMaxSize(10, {
    message: 'A maximum of 10 document IDs can be deleted at once.',
  })
  @IsUUID('7', {
    each: true,
    message: 'Each document ID must be a valid UUID.',
  })
  documentIds!: string[];
}
