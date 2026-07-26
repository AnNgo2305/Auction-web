import { useInfiniteQuery } from '@tanstack/react-query';
import { productApi } from '@/features/seller-hub/api/product.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import type { GetMyProductsQuery } from '@/features/seller-hub/schemas/product/get-my-products.schema';
import {
  type GetMyProductsResponse,
  ProductData,
} from '@/features/seller-hub/types/product/get-my-products.response';
import { ApiError } from '@/shared/api/api-error';

export function useGetMyProducts(query: GetMyProductsQuery) {
  return useInfiniteQuery<
    GetMyProductsResponse,
    ApiError,
    ProductData[],
    ReturnType<typeof productKeys.myList>,
    string | undefined
  >({
    queryKey: productKeys.myList(query),
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 30,
    queryFn: async ({ pageParam }): Promise<GetMyProductsResponse> => {
      return await productApi.getMyProducts({
        ...query,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data.meta.hasNextPage
        ? lastPage.data.meta.nextCursor
        : undefined;
    },
    select: ({ pages }) => pages.flatMap((page) => page.data.data),
  });
}