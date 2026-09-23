import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductCommentDto {
  @ApiProperty({
    description: 'Updated content of the product comment',
    example: 'Updated comment content after trying the product.',
    maxLength: 2000,
  })
  @IsString({
    message: 'Content must be a string.',
  })
  @MaxLength(2000, {
    message: 'Content must not exceed 2000 characters.',
  })
  content!: string;

  @ApiPropertyOptional({
    description: 'Updated rating given to the product, from 1 to 5',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({
    message: 'Rating must be an integer.',
  })
  @Min(1, {
    message: 'Rating must be at least 1.',
  })
  @Max(5, {
    message: 'Rating must not exceed 5.',
  })
  rating?: number;
}
