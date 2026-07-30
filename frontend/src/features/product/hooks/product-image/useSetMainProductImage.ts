import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productImageApi } from '@/features/product/api/product-image.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { SET_PRIMARY_PRODUCT_IMAGE_ERROR_MESSAGES } from '@/features/product/constants/product-image-error.messages';
import type { ApiResponseError } from '@/shared/types/error';
import type { SetPrimaryProductImageResponse } from '@/features/product/types/product-image/set-primary-product-image.response';

export function useSetPrimaryProductImage(
  productId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    SetPrimaryProductImageResponse,
    ApiResponseError,
    { imageId: string }
  >({
    mutationFn: async ({
      imageId,
    }): Promise<SetPrimaryProductImageResponse> => {
      return await productImageApi.setPrimaryImage(productId, imageId);
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
        (code && SET_PRIMARY_PRODUCT_IMAGE_ERROR_MESSAGES[code]) ??
        SET_PRIMARY_PRODUCT_IMAGE_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
