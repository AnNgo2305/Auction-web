import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '@/features/product/api/product.api.ts';
import { productKeys } from '@/features/seller-hub/constants/product-query-key.ts';
import { UPDATE_PRODUCT_ERROR_MESSAGES } from '@/features/product/constants/product-error.messages.ts';
import type { UpdateProductBody } from '@/features/product/schemas/product/update-product.schema.ts';
import type { UpdateProductResponse } from '@/features/product/types/product/update-product.response.ts';
import type { ApiResponseError } from '@/shared/types/error.ts';

export function useUpdateProduct(
  productId: string,
  onSuccessCallback?: (res: UpdateProductResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductResponse,
    ApiResponseError,
    UpdateProductBody
  >({
    mutationFn: async (
      body: UpdateProductBody,
    ): Promise<UpdateProductResponse> => {
      return await productApi.updateProduct(body);
    },

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(productId),
        }),
      ]);

      onSuccessCallback?.(response);
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && UPDATE_PRODUCT_ERROR_MESSAGES[code]) ??
        UPDATE_PRODUCT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
