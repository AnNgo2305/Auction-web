import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductCommentDto {
  @ApiProperty({
    description: 'Content of the product comment',
    example: 'This product has excellent quality and works as expected.',
    maxLength: 2000,
  })
  @IsString({ message: 'Content must be a string.' })
  @MaxLength(2000, { message: 'Content must not exceed 2000 characters.' })
  content!: string;

  @ApiPropertyOptional({
    description: 'Rating given to the product, from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Rating must be an integer.' })
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating must not exceed 5.' })
  rating?: number;
}
