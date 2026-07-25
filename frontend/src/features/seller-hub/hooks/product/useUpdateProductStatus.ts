import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '@/features/seller-hub/api/product.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { PRODUCT_STATUS_ACTION_ERROR_MESSAGES } from '@/features/seller-hub/constants/product-error.messages';
import type { ProductStatusActionResponse } from '@/features/seller-hub/types/product/product-status-action.response';
import type { ApiResponseError } from '@/shared/types/error';
import {
  PRODUCT_STATUS_ACTIONS,
  type ProductStatusAction,
} from '@/shared/types/product';

interface UpdateProductStatusVariables {
  productId: string;
  action: ProductStatusAction;
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    ProductStatusActionResponse,
    ApiResponseError,
    UpdateProductStatusVariables
  >({
    mutationFn: async ({ productId, action }) => {
      switch (action) {
        case PRODUCT_STATUS_ACTIONS.PUBLISH:
          return await productApi.publishProduct(productId);

        case PRODUCT_STATUS_ACTIONS.RESTORE:
          return await productApi.restoreProduct(productId);

        case PRODUCT_STATUS_ACTIONS.REMOVE:
          return await productApi.removeProduct(productId);
      }
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.me(),
      });

      toast.success(response.message);
    },

    onError: (error) => {
      const code = error.errorCode;
      const message =
        (code && PRODUCT_STATUS_ACTION_ERROR_MESSAGES[code]) ??
        PRODUCT_STATUS_ACTION_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
