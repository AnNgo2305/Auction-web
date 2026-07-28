import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '@/features/seller-hub/api/product.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import {
  DELETE_PRODUCT_ERROR_MESSAGES,
} from '@/features/seller-hub/constants/product-error.messages';
import type { DeleteProductResponse } from '@/features/seller-hub/types/product/delete-product.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<DeleteProductResponse, ApiResponseError, string>({
    mutationFn: async (productId: string): Promise<DeleteProductResponse> => {
      return await productApi.deleteProduct(productId);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.me(),
      });

      toast.success(response.message);
    },

    onError: (error) => {
      const code = error?.errorCode;
      const message =
        (code && DELETE_PRODUCT_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
