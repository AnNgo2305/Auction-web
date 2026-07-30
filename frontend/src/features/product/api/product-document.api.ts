import { api } from '@/shared/api/axios';
import type { UpdateProductDocumentsBody } from '@/features/product/schemas/product-document/update-product-documents.schema';
import type { DeleteProductDocumentsBody } from '@/features/product/schemas/product-document/delete-product-documents.schema';
import type { UpdateProductDocumentsResponse } from '@/features/product/types/product-document/update-product-documents.response';
import type { DeleteProductDocumentResponse } from '@/features/product/types/product-document/delete-product-document.response';
import type { DeleteProductDocumentsResponse } from '@/features/product/types/product-document/delete-product-documents.response';

const PRODUCT_DOCUMENT_API_PREFIX = '/product-documents';

export const productDocumentApi = {
  updateProductDocuments: async (
    productId: string,
    body: UpdateProductDocumentsBody,
  ): Promise<UpdateProductDocumentsResponse> => {
    const res = await api.put<UpdateProductDocumentsResponse>(
      `${PRODUCT_DOCUMENT_API_PREFIX}/${productId}/documents`,
      body,
    );

    return res.data;
  },

  deleteProductDocument: async (
    productId: string,
    documentId: string,
  ): Promise<DeleteProductDocumentResponse> => {
    const res = await api.delete<DeleteProductDocumentResponse>(
      `${PRODUCT_DOCUMENT_API_PREFIX}/${productId}/documents/${documentId}`,
    );

    return res.data;
  },

  deleteProductDocuments: async (
    productId: string,
    body: DeleteProductDocumentsBody,
  ): Promise<DeleteProductDocumentsResponse> => {
    const res = await api.delete<DeleteProductDocumentsResponse>(
      `${PRODUCT_DOCUMENT_API_PREFIX}/${productId}/documents`,
      {
        data: body,
      },
    );

    return res.data;
  },
};