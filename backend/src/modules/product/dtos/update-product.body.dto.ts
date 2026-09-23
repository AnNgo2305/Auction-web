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
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('7', {
    message: 'Product ID must be a valid UUID.',
  })
  productId!: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Sony Alpha Camera',
  })
  @IsString({
    message: 'Product name must be a string.',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'A mirrorless camera in excellent condition.',
  })
  @IsOptional()
  @IsString({
    message: 'Description must be a string.',
  })
  description?: string;

  @ApiProperty({
    description: 'Available stock quantity of the product',
    example: 10,
    minimum: 0,
  })
  @IsInt({
    message: 'Stock quantity must be an integer.',
  })
  @Min(0, {
    message: 'Stock quantity must be greater than or equal to 0.',
  })
  stockQuantity!: number;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    example: ProductStatus.DRAFT,
  })
  @IsEnum(ProductStatus, {
    message: 'Invalid product status.',
  })
  status!: ProductStatus;

  @ApiPropertyOptional({
    description: 'Product category IDs',
    type: [String],
    minItems: 1,
    example: [
      '660e8400-e29b-41d4-a716-446655440000',
      '770e8400-e29b-41d4-a716-446655440000',
    ],
  })
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

  @ApiProperty({
    description: 'Public category of the product',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  @IsEnum(PublicCategory, {
    message: 'Invalid public category.',
  })
  publicCategory!: PublicCategory;
}
