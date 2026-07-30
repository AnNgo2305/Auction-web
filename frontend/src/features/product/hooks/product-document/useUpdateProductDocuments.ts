import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productDocumentApi } from '@/features/product/api/product-document.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { UPDATE_PRODUCT_DOCUMENTS_ERROR_MESSAGES } from '@/features/product/constants/product-document-error.messages';
import type { UpdateProductDocumentsBody } from '@/features/product/schemas/product-document/update-product-documents.schema';
import type { UpdateProductDocumentsResponse } from '@/features/product/types/product-document/update-product-documents.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useUpdateProductDocuments(
  productId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductDocumentsResponse,
    ApiResponseError,
    UpdateProductDocumentsBody
  >({
    mutationFn: async (body): Promise<UpdateProductDocumentsResponse> => {
      return await productDocumentApi.updateProductDocuments(productId, body);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });

      onSuccessCallback?.();
    },

    onError: (err) => {
      const code = err.errorCode;

      const message =
        (code && UPDATE_PRODUCT_DOCUMENTS_ERROR_MESSAGES[code]) ??
        UPDATE_PRODUCT_DOCUMENTS_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
