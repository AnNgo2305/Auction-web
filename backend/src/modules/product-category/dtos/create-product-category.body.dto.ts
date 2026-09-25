import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductCategoryBodyDto {
  @ApiProperty({
    description: 'Product category name',
    example: 'Electronics',
    maxLength: 100,
  })
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(100, {
    message: 'Category name must not exceed 100 characters',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Category color in hexadecimal format',
    example: '#3B82F6',
  })
  @IsOptional()
  @IsHexColor({
    message: 'Category color must be a valid hex color',
  })
  color?: string;
}
