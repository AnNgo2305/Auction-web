import { api } from '@/shared/api/axios';
import type { CreateProductBody } from '@/features/seller-hub/schemas/product/create-product.schema';
import type { ProductStatusBulkActionBody } from '@/features/seller-hub/schemas/product/product-status-bulk-action.schema';
import type { GetMyProductsQuery } from '@/features/seller-hub/schemas/product/get-my-products.schema';
import type { CreateProductResponse } from '@/features/seller-hub/types/product/create-product.response';
import type { GetMyProductsResponse } from '@/features/seller-hub/types/product/get-my-products.response';
import type { DeleteProductResponse } from '@/features/seller-hub/types/product/delete-product.response';
import type { ProductStatusActionResponse } from '@/features/seller-hub/types/product/product-status-action.response';

const PRODUCT_API_PREFIX = '/products';

export const productApi = {
  getMyProducts: async (
    query: GetMyProductsQuery,
  ): Promise<GetMyProductsResponse> => {
    const res = await api.get<GetMyProductsResponse>(
      `${PRODUCT_API_PREFIX}/me`,
      {
        params: query,
      },
    );

    return res.data;
  },

  createProduct: async (
    body: CreateProductBody,
  ): Promise<CreateProductResponse> => {
    const res = await api.post<CreateProductResponse>(PRODUCT_API_PREFIX, body);

    return res.data;
  },

  deleteProduct: async (productId: string): Promise<DeleteProductResponse> => {
    const res = await api.delete<DeleteProductResponse>(
      `${PRODUCT_API_PREFIX}/${productId}`,
    );

    return res.data;
  },

  deleteProducts: async (
    productIds: string[],
  ): Promise<DeleteProductResponse> => {
    const res = await api.delete<DeleteProductResponse>(
      `${PRODUCT_API_PREFIX}/bulk/${productIds.join(',')}`,
    );

    return res.data;
  },

  publishProducts: async (
    body: ProductStatusBulkActionBody,
  ): Promise<ProductStatusActionResponse> => {
    const res = await api.patch<ProductStatusActionResponse>(
      `${PRODUCT_API_PREFIX}/publish`,
      body,
    );

    return res.data;
  },

  restoreProducts: async (
    body: ProductStatusBulkActionBody,
  ): Promise<ProductStatusActionResponse> => {
    const res = await api.patch<ProductStatusActionResponse>(
      `${PRODUCT_API_PREFIX}/restore`,
      body,
    );

    return res.data;
  },

  removeProducts: async (
    body: ProductStatusBulkActionBody,
  ): Promise<ProductStatusActionResponse> => {
    const res = await api.patch<ProductStatusActionResponse>(
      `${PRODUCT_API_PREFIX}/remove`,
      body,
    );

    return res.data;
  },

  publishProduct: async (
    productId: string,
  ): Promise<ProductStatusActionResponse> => {
    const res = await api.patch<ProductStatusActionResponse>(
      `${PRODUCT_API_PREFIX}/${productId}/publish`,
    );

    return res.data;
  },

  restoreProduct: async (
    productId: string,
  ): Promise<ProductStatusActionResponse> => {
    const res = await api.patch<ProductStatusActionResponse>(
      `${PRODUCT_API_PREFIX}/${productId}/restore`,
    );

    return res.data;
  },

  removeProduct: async (
    productId: string,
  ): Promise<ProductStatusActionResponse> => {
    const res = await api.patch<ProductStatusActionResponse>(
      `${PRODUCT_API_PREFIX}/${productId}/remove`,
    );

    return res.data;
  },
};
