import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  NAME = 'name',
  STOCK_QUANTITY = 'stockQuantity',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetMyProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Keyword used to search products by name',
    example: 'camera',
  })
  @IsOptional()
  @IsString({ message: 'Keyword must be a string.' })
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Filter products by status',
    enum: ProductStatus,
    example: ProductStatus.READY,
  })
  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Invalid product status.' })
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Filter products by public category',
    enum: PublicCategory,
    example: PublicCategory.ELECTRONICS,
  })
  @IsOptional()
  @IsEnum(PublicCategory, { message: 'Invalid public category.' })
  publicCategory?: PublicCategory;

  @ApiPropertyOptional({
    description: 'Filter products by category IDs',
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '660e8400-e29b-41d4-a716-446655440000',
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Category IDs must be an array.' })
  @IsUUID('7', {
    each: true,
    message: 'Each category ID must be a valid UUID.',
  })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter products created from this date',
    example: '2026-09-01T00:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Created from must be a valid date.' })
  createdAtFrom?: Date;

  @ApiPropertyOptional({
    description: 'Filter products created until this date',
    example: '2026-09-30T23:59:59.999Z',
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Created to must be a valid date.' })
  createdAtTo?: Date;

  @ApiPropertyOptional({
    description: 'Cursor used to retrieve the next page of products',
    example: '770e8400-e29b-41d4-a716-446655440000',
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
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(100, { message: 'Limit cannot exceed 100.' })
  limit = 10;

  @ApiPropertyOptional({
    description: 'Field used to sort the products',
    enum: ProductSortBy,
    default: ProductSortBy.CREATED_AT,
    example: ProductSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProductSortBy, { message: 'Invalid sort field.' })
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be either asc or desc.' })
  sortOrder: SortOrder = SortOrder.DESC;
}
