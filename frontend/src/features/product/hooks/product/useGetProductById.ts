import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/features/product/api/product.api.ts';
import { productKeys } from '@/features/seller-hub/constants/product-query-key.ts';
import type {
  GetProductByIdResponse,
  ProductData,
} from '@/features/product/types/product/get-product-by-id.response.ts';
import { ApiError } from '@/shared/api/api-error.ts';

export function useGetProductById(productId: string) {
  return useQuery<GetProductByIdResponse, ApiError, ProductData>({
    queryKey: productKeys.detail(productId),
    queryFn: () => productApi.getProductById(productId),
    enabled: !!productId,
    staleTime: 1000 * 30,
    select: (response) => response.data,
  });
}
