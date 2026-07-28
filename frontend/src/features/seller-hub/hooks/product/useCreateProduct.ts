import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '@/features/seller-hub/api/product.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { CREATE_PRODUCT_ERROR_MESSAGES } from '@/features/seller-hub/constants/product-error.messages';
import type { CreateProductBody } from '@/features/seller-hub/schemas/product/create-product.schema';
import type { CreateProductResponse } from '@/features/seller-hub/types/product/create-product.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useCreateProduct(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductResponse,
    ApiResponseError,
    CreateProductBody
  >({
    mutationFn: async (
      body: CreateProductBody,
    ): Promise<CreateProductResponse> => {
      return await productApi.createProduct(body);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.me(),
      });

      toast.success(response.message);
      onSuccessCallback?.();
    },

    onError: (error) => {
      const code = error?.errorCode;
      const message =
        (code && CREATE_PRODUCT_ERROR_MESSAGES[code]) ??
        CREATE_PRODUCT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
