import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';
import {
  MAX_PRODUCT_DOCUMENTS,
  MAX_PRODUCT_IMAGES,
} from '@modules/product/product.constant';

export class CreateProductImageDto {
  @ApiProperty({
    description: 'Storage key of the product image',
    example:
      'users/550e8400-e29b-41d4-a716-446655440000/products/660e8400-e29b-41d4-a716-446655440000/image.jpg',
  })
  @IsNotEmpty({ message: 'Image key is required' })
  @IsString({ message: 'Image key must be a string' })
  imageKey!: string;

  @ApiProperty({
    description: 'Whether this image is the primary product image',
    example: true,
  })
  @IsBoolean({ message: 'isPrimary must be a boolean' })
  isPrimary!: boolean;
}

export class CreateProductDocumentDto {
  @ApiProperty({
    description: 'Display name of the product document',
    example: 'User Manual.pdf',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString({ message: 'Document name must be a string' })
  @MaxLength(255, {
    message: 'Document name must not exceed 255 characters',
  })
  documentName!: string;

  @ApiProperty({
    description: 'Storage key of the product document',
    example:
      'users/550e8400-e29b-41d4-a716-446655440000/products/660e8400-e29b-41d4-a716-446655440000/manual.pdf',
  })
  @IsNotEmpty({ message: 'Document key is required' })
  @IsString({ message: 'Document key must be a string' })
  documentKey!: string;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Sony Alpha Camera',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  @MaxLength(255, {
    message: 'Product name must not exceed 255 characters',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'A mirrorless camera in excellent condition.',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Available stock quantity of the product',
    example: 10,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, {
    message: 'Stock quantity must be greater than or equal to 0',
  })
  stockQuantity!: number;

  @ApiProperty({
    description: 'Public category of the product',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  @IsEnum(PublicCategory, {
    message: 'Invalid public category',
  })
  publicCategory!: PublicCategory;

  @ApiPropertyOptional({
    description: 'Product category IDs assigned to the product',
    type: [String],
    example: [
      '770e8400-e29b-41d4-a716-446655440000',
      '880e8400-e29b-41d4-a716-446655440000',
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Category IDs must be an array' })
  @IsString({
    each: true,
    message: 'Each category ID must be a string',
  })
  categoryIds?: string[];

  @ApiProperty({
    description: 'Initial status of the product',
    enum: ProductStatus,
    example: ProductStatus.DRAFT,
  })
  @IsEnum(ProductStatus, {
    message: 'Invalid product status',
  })
  status!: ProductStatus;

  @ApiProperty({
    description: 'Product images',
    type: [CreateProductImageDto],
    minItems: 1,
    maxItems: MAX_PRODUCT_IMAGES,
    example: [
      {
        imageKey:
          'users/550e8400-e29b-41d4-a716-446655440000/products/660e8400-e29b-41d4-a716-446655440000/image.jpg',
        isPrimary: true,
      },
    ],
  })
  @IsArray({ message: 'Images must be an array' })
  @ArrayNotEmpty({
    message: 'At least one product image is required',
  })
  @ArrayMaxSize(MAX_PRODUCT_IMAGES, {
    message: `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images!: CreateProductImageDto[];

  @ApiPropertyOptional({
    description: 'Product documents',
    type: [CreateProductDocumentDto],
    maxItems: MAX_PRODUCT_DOCUMENTS,
    example: [
      {
        documentName: 'User Manual.pdf',
        documentKey:
          'users/550e8400-e29b-41d4-a716-446655440000/products/660e8400-e29b-41d4-a716-446655440000/manual.pdf',
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Documents must be an array' })
  @ArrayMaxSize(MAX_PRODUCT_DOCUMENTS, {
    message: `A product can have at most ${MAX_PRODUCT_DOCUMENTS} documents`,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductDocumentDto)
  documents?: CreateProductDocumentDto[];
}
