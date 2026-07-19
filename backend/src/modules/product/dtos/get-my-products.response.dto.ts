import type { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export class ProductCategoryDto {
  categoryId!: string;

  name!: string;
}

export class GetMyProductsResponseDto {
  productId!: string;

  name!: string;

  description?: string;

  stockQuantity!: number;

  status!: ProductStatus;

  thumbnail?: string;

  publicCategory!: PublicCategory;

  categories!: ProductCategoryDto[];

  createdAt!: Date;

  updatedAt!: Date;
}
