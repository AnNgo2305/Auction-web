import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productCategoryApi } from '@/features/seller-hub/api/product-category.api';
import { productCategoryKeys } from '@/features/seller-hub/constants/product-category-query-key';
import { DELETE_PRODUCT_CATEGORIES_ERROR_MESSAGES } from '@/features/seller-hub/constants/product-category-error.messages';
import type { DeleteProductCategoriesBody } from '@/features/seller-hub/schemas/product-category/delete-product-categories.schema';
import type { DeleteProductCategoriesResponse } from '@/features/seller-hub/types/product-category/delete-product-categories.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteProductCategories() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteProductCategoriesResponse,
    ApiResponseError,
    DeleteProductCategoriesBody
  >({
    mutationFn: productCategoryApi.deleteProductCategories,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productCategoryKeys.me(),
      });

      toast.success(response.message);
    },

    onError: (error) => {
      const code = error.errorCode;
      const message =
        (code && DELETE_PRODUCT_CATEGORIES_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_CATEGORIES_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
