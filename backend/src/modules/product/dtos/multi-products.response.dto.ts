import { IsString, IsInt, IsOptional, IsArray } from 'class-validator';
import { ProductStatus } from '@generated/prisma/enums';

export class ProductCategoryDto {
  @IsString()
  categoryId!: string;

  @IsString()
  name!: string;
}

export class ProductImageDto {
  @IsString()
  imageId!: string;

  @IsString()
  imageUrl!: string;

  @IsOptional()
  isPrimary?: boolean;
}

export class ProductDto {
  @IsString()
  productId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  stockQuantity!: number;

  status!: ProductStatus;

  @IsArray()
  categories!: ProductCategoryDto[];

  @IsArray()
  images!: ProductImageDto[];
}
