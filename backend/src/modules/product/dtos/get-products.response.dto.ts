import type { ProductStatus, PublicCategory } from '@generated/prisma/enums';

export class ProductCategoryDto {
  categoryId!: string;

  name!: string;
}

export class GetProductsResponseDto {
  sellerId!: string;

  sellerName!: string;

  productId!: string;

  name!: string;

  description?: string;

  publicCategory!: PublicCategory;

  status!: ProductStatus;

  thumbnail?: string;

  categories!: ProductCategoryDto[];

  createdAt!: Date;

  updatedAt!: Date;
}
