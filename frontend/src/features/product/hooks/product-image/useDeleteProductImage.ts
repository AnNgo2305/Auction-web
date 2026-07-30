import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productImageApi } from '@/features/product/api/product-image.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { DELETE_PRODUCT_IMAGE_ERROR_MESSAGES } from '@/features/product/constants/product-image-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { DeleteProductImageResponse } from '@/features/product/types/product-image/delete-product-image.response';

export function useDeleteProductImage(
  productId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteProductImageResponse,
    ApiResponseError,
    { imageId: string }
  >({
    mutationFn: async ({ imageId }): Promise<DeleteProductImageResponse> => {
      return await productImageApi.deleteProductImage(productId, imageId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });

      onSuccessCallback?.();
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && DELETE_PRODUCT_IMAGE_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
