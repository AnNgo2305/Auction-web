import { useQuery } from '@tanstack/react-query';
import { productCategoryApi } from '@/features/seller-hub/api/product-category.api';
import { productCategoryKeys } from '@/features/seller-hub/constants/product-category-query-key';
import type { GetMyProductCategoriesResponse } from '@/features/seller-hub/types/product-category/get-my-product-categories.response';
import type { ApiResponseError } from '@/shared/types/error';

type GetMyProductCategoriesData =
  GetMyProductCategoriesResponse['data']['categories'];

export function useGetMyProductCategories(enabled = true) {
  return useQuery<
    GetMyProductCategoriesResponse,
    ApiResponseError,
    GetMyProductCategoriesData
  >({
    queryKey: productCategoryKeys.me(),
    queryFn: productCategoryApi.getMyProductCategories,
    staleTime: 1000 * 60 * 5,
    enabled,
    select: (response) => response.data.categories,
  });
}
