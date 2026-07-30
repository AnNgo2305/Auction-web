import type { ApiResponse } from '@/shared/types/response.ts';
import type { PaginationData } from '@/shared/types/pagination.ts';
import type { ProductStatus, PublicCategory } from '@/shared/types/product.ts';

export class ProductCategoryData {
  categoryId!: string;

  name!: string;
}

export class ProductData {
  sellerId!: string;

  sellerName!: string;

  productId!: string;

  name!: string;

  description!: string | null;

  publicCategory!: PublicCategory;

  status!: ProductStatus;

  thumbnail!: string | null;

  categories!: ProductCategoryData[];

  createdAt!: string;

  updatedAt!: string;
}

export type GetProductsResponse = ApiResponse<PaginationData<ProductData>>;
