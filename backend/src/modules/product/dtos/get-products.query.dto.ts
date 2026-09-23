import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export const PUBLIC_PRODUCT_STATUS = {
  READY: ProductStatus.READY,
  AUCTIONING: ProductStatus.AUCTIONING,
} as const;

export type PublicProductStatus =
  (typeof PUBLIC_PRODUCT_STATUS)[keyof typeof PUBLIC_PRODUCT_STATUS];

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Keyword used to search products by name',
    example: 'camera',
  })
  @IsOptional()
  @IsString({
    message: 'Keyword must be a string.',
  })
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Filter products by public category',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  @IsOptional()
  @IsEnum(PublicCategory, {
    message: 'Invalid public category.',
  })
  publicCategory?: PublicCategory;

  @ApiPropertyOptional({
    description: 'Filter products by public product status',
    enum: PUBLIC_PRODUCT_STATUS,
    example: ProductStatus.READY,
  })
  @IsOptional()
  @IsEnum(PUBLIC_PRODUCT_STATUS, {
    message: 'Invalid product status.',
  })
  status?: PublicProductStatus;

  @ApiPropertyOptional({
    description: 'Cursor used to retrieve the next page of products',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('7', {
    message: 'Cursor must be a valid UUID.',
  })
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of products to return',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'Limit must be an integer.',
  })
  @Min(1, {
    message: 'Limit must be at least 1.',
  })
  @Max(100, {
    message: 'Limit must not exceed 100.',
  })
  limit = 10;

  @ApiPropertyOptional({
    description: 'Field used to sort the products',
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
    example: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy, {
    message: 'Invalid sortBy value.',
  })
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, {
    message: 'Invalid sortOrder value.',
  })
  sortOrder: SortOrder = SortOrder.DESC;
}
