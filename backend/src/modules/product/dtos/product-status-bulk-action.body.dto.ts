import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ProductStatusBulkActionDto {
  @ApiProperty({
    description: 'Product IDs to apply the status action to',
    type: [String],
    format: 'uuid',
    minItems: 1,
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '660e8400-e29b-41d4-a716-446655440000',
    ],
  })
  @Type(() => String)
  @IsArray({
    message: 'Product IDs must be an array.',
  })
  @ArrayNotEmpty({
    message: 'Product IDs must not be empty.',
  })
  @IsUUID('7', {
    each: true,
    message: 'Each product ID must be a valid UUID.',
  })
  productIds!: string[];
}
