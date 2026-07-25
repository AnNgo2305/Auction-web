import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productCategoryApi } from '@/features/seller-hub/api/product-category.api';
import { productCategoryKeys } from '@/features/seller-hub/constants/product-category-query-key';
import { CREATE_PRODUCT_CATEGORY_ERROR_MESSAGES } from '@/features/seller-hub/constants/product-category-error.messages';
import type { CreateProductCategoryBody } from '@/features/seller-hub/schemas/product-category/create-product-category.schema';
import type { CreateProductCategoryResponse } from '@/features/seller-hub/types/product-category/create-product-category.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useCreateProductCategory(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductCategoryResponse,
    ApiResponseError,
    CreateProductCategoryBody
  >({
    mutationFn: productCategoryApi.createProductCategory,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productCategoryKeys.me(),
      });

      toast.success(response.message);
      onSuccessCallback?.();
    },

    onError: (error) => {
      const code = error.errorCode;
      const message =
        (code && CREATE_PRODUCT_CATEGORY_ERROR_MESSAGES[code]) ??
        CREATE_PRODUCT_CATEGORY_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
