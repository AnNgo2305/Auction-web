import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '@/features/seller-hub/api/product.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { PRODUCT_STATUS_ACTION_ERROR_MESSAGES } from '@/features/seller-hub/constants/product-error.messages';
import type { ProductStatusBulkActionBody } from '@/features/seller-hub/schemas/product/product-status-bulk-action.schema';
import type { ProductStatusActionResponse } from '@/features/seller-hub/types/product/product-status-action.response';
import type { ApiResponseError } from '@/shared/types/error';
import {
  PRODUCT_STATUS_ACTIONS,
  type ProductStatusAction,
} from '@/shared/types/product';

interface UpdateProductsStatusVariables {
  body: ProductStatusBulkActionBody;
  action: ProductStatusAction;
}

export function useUpdateProductsStatus(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<
    ProductStatusActionResponse,
    ApiResponseError,
    UpdateProductsStatusVariables
  >({
    mutationFn: async ({ body, action }) => {
      switch (action) {
        case PRODUCT_STATUS_ACTIONS.PUBLISH:
          return await productApi.publishProducts(body);

        case PRODUCT_STATUS_ACTIONS.RESTORE:
          return await productApi.restoreProducts(body);

        case PRODUCT_STATUS_ACTIONS.REMOVE:
          return await productApi.removeProducts(body);
      }
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.me(),
      });

      toast.success(response.message);
      onSuccessCallback?.();
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
