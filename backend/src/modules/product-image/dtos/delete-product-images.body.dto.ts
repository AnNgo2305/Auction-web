import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class DeleteProductImagesDto {
  @ApiProperty({
    description: 'IDs of the product images to delete',
    type: [String],
    minItems: 1,
    example: [
      '018f3c5e-7b3a-7abc-8def-1234567890ab',
      '018f3c5e-7b3a-7def-8abc-abcdef123456',
    ],
  })
  @IsArray({
    message: 'Image IDs must be an array.',
  })
  @ArrayMinSize(1, {
    message: 'At least one image ID is required.',
  })
  @IsString({
    each: true,
    message: 'Each image ID must be a string.',
  })
  imageIds!: string[];
}
