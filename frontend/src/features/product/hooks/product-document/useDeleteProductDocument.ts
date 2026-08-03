import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productDocumentApi } from '@/features/product/api/product-document.api';
import { DELETE_PRODUCT_DOCUMENT_ERROR_MESSAGES } from '@/features/product/constants/product-document-error.messages';
import type { DeleteProductDocumentResponse } from '@/features/product/types/product-document/delete-product-document.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteProductDocument(
  productId: string,
  onSuccessCallback?: () => void,
) {
  return useMutation<
    DeleteProductDocumentResponse,
    ApiResponseError,
    { documentId: string }
  >({
    mutationFn: async ({
      documentId,
    }): Promise<DeleteProductDocumentResponse> => {
      return await productDocumentApi.deleteProductDocument(
        productId,
        documentId,
      );
    },

    onSuccess: async () => {
      onSuccessCallback?.();
    },

    onError: (err) => {
      const code = err.errorCode;

      const message =
        (code && DELETE_PRODUCT_DOCUMENT_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_DOCUMENT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
