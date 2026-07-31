import type { PublicCategory } from '@generated/prisma/enums';

export class ProductCategoryDto {
  categoryId!: string;

  name!: string;
}

export class GetProductsResponseDto {
  sellerId!: string;

  sellerName!: string;

  productId!: string;

  name!: string;

  publicCategory!: PublicCategory;

  thumbnail?: string;

  categories!: ProductCategoryDto[];

  createdAt!: Date;
}
