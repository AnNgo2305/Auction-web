import type { ApiResponse } from '@/shared/types/response';
import type { ProductStatus, PublicCategory } from '@/shared/types/product';
import type { PaginationData } from '@/shared/types/pagination.ts';

export class ProductCategoryData {
  categoryId!: string;

  name!: string;
}

export class ProductData {
  productId!: string;

  name!: string;

  description!: string | null;

  stockQuantity!: number;

  status!: ProductStatus;

  thumbnail!: string | null;

  publicCategory!: PublicCategory;

  categories!: ProductCategoryData[];

  createdAt!: string;

  updatedAt!: string;
}

export type GetMyProductsResponse = ApiResponse<PaginationData<ProductData>>;
