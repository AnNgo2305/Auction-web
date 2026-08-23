import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productImageApi } from '@/features/product/api/product-image.api';
import { DELETE_PRODUCT_IMAGES_ERROR_MESSAGES } from '@/features/product/constants/product-image-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { DeleteProductImagesBody } from '@/features/product/schemas/product-image/delete-product-images.schema';
import type { DeleteProductImagesResponse } from '@/features/product/types/product-image/delete-product-images.response';

export function useDeleteProductImages(
  productId: string,
  onSuccessCallback?: () => void,
) {
  return useMutation<
    DeleteProductImagesResponse,
    ApiResponseError,
    DeleteProductImagesBody
  >({
    mutationFn: async (body): Promise<DeleteProductImagesResponse> => {
      return await productImageApi.deleteProductImages(productId, body);
    },

    onSuccess: () => {
      onSuccessCallback?.();
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && DELETE_PRODUCT_IMAGES_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_IMAGES_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
