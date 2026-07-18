import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductCategoryBodyDto {
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(100, { message: 'Category name must not exceed 100 characters' })
  name: string;

  @IsOptional()
  @IsHexColor({ message: 'Category color must be a valid hex color' })
  color?: string;
}
