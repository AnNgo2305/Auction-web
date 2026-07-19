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
import { ProductStatus, PublicCategory } from '@generated/prisma/enums';

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
  @IsOptional()
  @IsString({
    message: 'Keyword must be a string.',
  })
  keyword?: string;

  @IsOptional()
  @IsEnum(PublicCategory, {
    message: 'Invalid public category.',
  })
  publicCategory?: PublicCategory;

  @IsOptional()
  @IsEnum(ProductStatus, {
    message: 'Invalid product status.',
  })
  status?: ProductStatus;

  @IsOptional()
  @IsUUID('4', {
    message: 'Cursor must be a valid UUID.',
  })
  cursor?: string;

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

  @IsOptional()
  @IsEnum(ProductSortBy, {
    message: 'Invalid sortBy value.',
  })
  sortBy: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder, {
    message: 'Invalid sortOrder value.',
  })
  sortOrder: SortOrder = SortOrder.DESC;
}
