import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productCategoryApi } from '@/features/seller-hub/api/product-category.api';
import { productCategoryKeys } from '@/features/seller-hub/constants/product-category-query-key';
import { DELETE_PRODUCT_CATEGORY_ERROR_MESSAGES } from '@/features/seller-hub/constants/product-category-error.messages';
import type { DeleteProductCategoryResponse } from '@/features/seller-hub/types/product-category/delete-product-category.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();

  return useMutation<DeleteProductCategoryResponse, ApiResponseError, string>({
    mutationFn: productCategoryApi.deleteProductCategoryById,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productCategoryKeys.me(),
      });

      toast.success(response.message);
    },

    onError: (error) => {
      const code = error.errorCode;
      const message =
        (code && DELETE_PRODUCT_CATEGORY_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_CATEGORY_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
