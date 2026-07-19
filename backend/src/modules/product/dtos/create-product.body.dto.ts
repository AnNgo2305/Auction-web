import { Type } from 'class-transformer';
import {
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
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export class CreateProductImageDto {
  @IsNotEmpty({ message: 'Image key is required' })
  @IsString({ message: 'Image key must be a string' })
  imageKey!: string;

  @IsBoolean({ message: 'isPrimary must be a boolean' })
  isPrimary!: boolean;
}

export class CreateProductDocumentDto {
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString({ message: 'Document name must be a string' })
  @MaxLength(255, {
    message: 'Document name must not exceed 255 characters',
  })
  documentName!: string;

  @IsNotEmpty({ message: 'Document key is required' })
  @IsString({ message: 'Document key must be a string' })
  documentKey!: string;
}

export class CreateProductDto {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  @MaxLength(255, {
    message: 'Product name must not exceed 255 characters',
  })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @Type(() => Number)
  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, {
    message: 'Stock quantity must be greater than or equal to 0',
  })
  stockQuantity!: number;

  @IsEnum(PublicCategory, {
    message: 'Invalid public category',
  })
  publicCategory!: PublicCategory;

  @IsOptional()
  @IsArray({ message: 'Category IDs must be an array' })
  @IsString({
    each: true,
    message: 'Each category ID must be a string',
  })
  categoryIds?: string[];

  @IsEnum(ProductStatus, {
    message: 'Invalid product status',
  })
  status!: ProductStatus;

  @IsArray({ message: 'Images must be an array' })
  @ArrayNotEmpty({
    message: 'At least one product image is required',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images!: CreateProductImageDto[];

  @IsOptional()
  @IsArray({ message: 'Documents must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductDocumentDto)
  documents?: CreateProductDocumentDto[];
}
