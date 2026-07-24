import type { ApiResponse } from '@/shared/types/response.ts';

export class ProductCategoryData {
  categoryId!: string;

  name!: string;

  color!: string;
}

export class GetMyProductCategoriesData {
  categories!: ProductCategoryData[];
}

export type GetMyProductCategoriesResponse =
  ApiResponse<GetMyProductCategoriesData>;
