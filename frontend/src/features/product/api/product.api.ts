import { api } from '@/shared/api/axios';
import type { GetProductsQuery } from '@/features/product/schemas/product/get-products.schema.ts';
import type { UpdateProductBody } from '@/features/product/schemas/product/update-product.schema.ts';
import type { GetProductsResponse } from '@/features/product/types/product/get-products.response.ts';
import type { GetProductByIdResponse } from '@/features/product/types/product/get-product-by-id.response.ts';
import type { UpdateProductResponse } from '@/features/product/types/product/update-product.response.ts';

const PRODUCT_API_PREFIX = '/products';

export const productApi = {
  getProducts: async (
    query: GetProductsQuery,
  ): Promise<GetProductsResponse> => {
    const res = await api.get<GetProductsResponse>(PRODUCT_API_PREFIX, {
      params: query,
    });

    return res.data;
  },

  getProductById: async (
    productId: string,
  ): Promise<GetProductByIdResponse> => {
    const res = await api.get<GetProductByIdResponse>(
      `${PRODUCT_API_PREFIX}/${productId}`,
    );

    return res.data;
  },

  updateProduct: async (
    body: UpdateProductBody,
  ): Promise<UpdateProductResponse> => {
    const res = await api.put<UpdateProductResponse>(PRODUCT_API_PREFIX, body);

    return res.data;
  },
};
