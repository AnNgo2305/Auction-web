import { api } from '@/shared/api/axios';
import type { CreateProductCategoryBody } from '@/features/seller-hub/schemas/product-category/create-product-category.schema';
import type { DeleteProductCategoriesBody } from '@/features/seller-hub/schemas/product-category/delete-product-categories.schema';
import type { GetMyProductCategoriesResponse } from '@/features/seller-hub/types/product-category/get-my-product-categories.response';
import type { ApiResponse } from '@/shared/types/response';
import type {
  CreateProductCategoryResponse
} from '@/features/seller-hub/types/product-category/create-product-category.response.ts';
import type {
  DeleteProductCategoriesResponse
} from '@/features/seller-hub/types/product-category/delete-product-categories.response.ts';
import type {
  DeleteProductCategoryResponse
} from '@/features/seller-hub/types/product-category/delete-product-category.response.ts';

const PRODUCT_CATEGORY_API_PREFIX = '/product-categories';

export const productCategoryApi = {
  getMyProductCategories: async (): Promise<GetMyProductCategoriesResponse> => {
    const res = await api.get<GetMyProductCategoriesResponse>(
      `${PRODUCT_CATEGORY_API_PREFIX}/me`,
    );

    return res.data;
  },

  createProductCategory: async (
    body: CreateProductCategoryBody,
  ): Promise<ApiResponse<{}>> => {
    const res = await api.post<CreateProductCategoryResponse>(
      PRODUCT_CATEGORY_API_PREFIX,
      body,
    );

    return res.data;
  },

  deleteProductCategoryById: async (
    categoryId: string,
  ): Promise<ApiResponse<{}>> => {
    const res = await api.delete<DeleteProductCategoryResponse>(
      `${PRODUCT_CATEGORY_API_PREFIX}/${categoryId}`,
    );

    return res.data;
  },

  deleteProductCategories: async (
    body: DeleteProductCategoriesBody,
  ): Promise<ApiResponse<{}>> => {
    const res = await api.delete<DeleteProductCategoriesResponse>(
      PRODUCT_CATEGORY_API_PREFIX,
      {
        data: body,
      },
    );

    return res.data;
  },
};
