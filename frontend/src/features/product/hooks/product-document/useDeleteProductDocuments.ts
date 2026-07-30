import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productDocumentApi } from '@/features/product/api/product-document.api';
import { productKeys } from '@/features/seller-hub/constants/product-query-key';
import { DELETE_PRODUCT_DOCUMENTS_ERROR_MESSAGES } from '@/features/product/constants/product-document-error.messages';
import type { DeleteProductDocumentsBody } from '@/features/product/schemas/product-document/delete-product-documents.schema';
import type { DeleteProductDocumentsResponse } from '@/features/product/types/product-document/delete-product-documents.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteProductDocuments(
  productId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteProductDocumentsResponse,
    ApiResponseError,
    DeleteProductDocumentsBody
  >({
    mutationFn: async (body): Promise<DeleteProductDocumentsResponse> => {
      return await productDocumentApi.deleteProductDocuments(productId, body);
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
        (code && DELETE_PRODUCT_DOCUMENTS_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_DOCUMENTS_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
