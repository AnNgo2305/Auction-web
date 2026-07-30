import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { productApi } from '@/features/product/api/product.api.ts';
import { productKeys } from '@/features/seller-hub/constants/product-query-key.ts';
import type { GetProductsQuery } from '@/features/product/schemas/product/get-products.schema.ts';
import type { GetProductsResponse } from '@/features/product/types/product/get-products.response.ts';
import { ApiError } from '@/shared/api/api-error.ts';

export function useGetProducts(query: GetProductsQuery) {
  return useInfiniteQuery<
    GetProductsResponse,
    ApiError,
    InfiniteData<GetProductsResponse, string | undefined>,
    ReturnType<typeof productKeys.publicList>,
    string | undefined
  >({
    queryKey: productKeys.publicList(query),
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    queryFn: async ({ pageParam }): Promise<GetProductsResponse> => {
      return await productApi.getProducts({
        ...query,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data.meta.hasNextPage
        ? lastPage.data.meta.nextCursor
        : undefined;
    },
  });
}
