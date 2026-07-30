import { api } from '@/shared/api/axios';
import type { GetProductCommentsQuery } from '@/features/product/schemas/product-comment/get-product-comments.schema';
import type { CreateProductCommentBody } from '@/features/product/schemas/product-comment/create-product-comment.schema';
import type { UpdateProductCommentBody } from '@/features/product/schemas/product-comment/update-product-comment.schema';
import type { GetProductCommentsResponse } from '@/features/product/types/product-comment/get-product-comments.response';
import type { CreateProductCommentResponse } from '@/features/product/types/product-comment/create-product-comment.response';
import type { UpdateProductCommentResponse } from '@/features/product/types/product-comment/update-product-comment.response';
import type { DeleteProductCommentResponse } from '@/features/product/types/product-comment/delete-product-comment.response';

const PRODUCT_COMMENT_API_PREFIX = '/product-comments';

export const productCommentApi = {
  getProductComments: async (
    productId: string,
    query: GetProductCommentsQuery,
  ): Promise<GetProductCommentsResponse> => {
    const res = await api.get<GetProductCommentsResponse>(
      `${PRODUCT_COMMENT_API_PREFIX}/${productId}/comments`,
      {
        params: query,
      },
    );

    return res.data;
  },

  createProductComment: async (
    productId: string,
    body: CreateProductCommentBody,
  ): Promise<CreateProductCommentResponse> => {
    const res = await api.post<CreateProductCommentResponse>(
      `${PRODUCT_COMMENT_API_PREFIX}/${productId}/comments`,
      body,
    );

    return res.data;
  },

  updateProductComment: async (
    productId: string,
    commentId: string,
    body: UpdateProductCommentBody,
  ): Promise<UpdateProductCommentResponse> => {
    const res = await api.patch<UpdateProductCommentResponse>(
      `${PRODUCT_COMMENT_API_PREFIX}/${productId}/comments/${commentId}`,
      body,
    );

    return res.data;
  },

  deleteProductComment: async (
    productId: string,
    commentId: string,
  ): Promise<DeleteProductCommentResponse> => {
    const res = await api.delete<DeleteProductCommentResponse>(
      `${PRODUCT_COMMENT_API_PREFIX}/${productId}/comments/${commentId}`,
    );

    return res.data;
  },
};
