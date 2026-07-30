import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productImageApi } from '@/features/product/api/product-image.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { UPDATE_PRODUCT_IMAGES_ERROR_MESSAGES } from '@/features/product/constants/product-image-error.messages';
import type { UpdateProductImagesBody } from '@/features/product/schemas/product-image/update-product-images.schema';
import type { UpdateProductImagesResponse } from '@/features/product/types/product-image/update-product-images.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useUpdateProductImages(
  productId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductImagesResponse,
    ApiResponseError,
    UpdateProductImagesBody
  >({
    mutationFn: async (body): Promise<UpdateProductImagesResponse> => {
      return await productImageApi.updateProductImages(productId, body);
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
        (code && UPDATE_PRODUCT_IMAGES_ERROR_MESSAGES[code]) ??
        UPDATE_PRODUCT_IMAGES_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
