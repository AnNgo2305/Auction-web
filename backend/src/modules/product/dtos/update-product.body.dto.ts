import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';
import { ProductStatus } from '@generated/prisma/enums';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsUUID('4', {
    message: 'Product ID must be a valid UUID.',
  })
  productId!: string;

  @IsString({
    message: 'Product name must be a string.',
  })
  name!: string;

  @IsOptional()
  @IsString({
    message: 'Description must be a string.',
  })
  description?: string;

  @IsInt({
    message: 'Stock quantity must be an integer.',
  })
  @Min(0, {
    message: 'Stock quantity must be greater than or equal to 0.',
  })
  stockQuantity!: number;

  @IsEnum(ProductStatus, {
    message: 'Invalid product status.',
  })
  status!: ProductStatus;

  @IsArray({
    message: 'Category IDs must be an array.',
  })
  @ArrayNotEmpty({
    message: 'Category IDs cannot be empty.',
  })
  @IsString({
    each: true,
    message: 'Each category ID must be a string.',
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? (value as string[]) : [value as string];
  })
  categoryIds?: string[];
}
