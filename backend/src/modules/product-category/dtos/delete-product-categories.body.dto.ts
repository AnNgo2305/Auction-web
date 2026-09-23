import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteProductCategoriesBodyDto {
  @ApiProperty({
    description: 'IDs of the product categories to delete',
    type: [String],
    minItems: 1,
    example: [
      '018f3c5e-7b3a-7abc-8def-1234567890ab',
      '018f3c5e-7b3a-7def-8abc-abcdef123456',
    ],
  })
  @IsArray({ message: 'Category IDs must be an array' })
  @ArrayNotEmpty({ message: 'Category IDs cannot be empty' })
  @IsUUID('7', {
    each: true,
    message: 'Each category ID must be a valid UUID',
  })
  categoryIds!: string[];
}
