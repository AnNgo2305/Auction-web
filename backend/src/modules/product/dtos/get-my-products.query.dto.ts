import { ProductStatus, PublicCategory } from '@generated/prisma/enums';
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
  @IsOptional()
  @IsString({ message: 'Keyword must be a string.' })
  keyword?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Invalid product status.' })
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(PublicCategory, { message: 'Invalid public category.' })
  publicCategory?: PublicCategory;

  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID.' })
  categoryId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Cursor must be a valid UUID.' })
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer.' })
  @Min(1, { message: 'Limit must be at least 1.' })
  @Max(100, { message: 'Limit cannot exceed 100.' })
  limit = 10;

  @IsOptional()
  @IsEnum(ProductSortBy, { message: 'Invalid sort field.' })
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be either asc or desc.' })
  sortOrder: SortOrder = SortOrder.DESC;
}
