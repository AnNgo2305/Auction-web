import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productCommentApi } from '@/features/product/api/product-comment.api';
import { productCommentKeys } from '@/features/product/constants/product-comment-query-key';
import { CREATE_PRODUCT_COMMENT_ERROR_MESSAGES } from '@/features/product/constants/product-comment-error.messages';
import type { CreateProductCommentBody } from '@/features/product/schemas/product-comment/create-product-comment.schema';
import type { CreateProductCommentResponse } from '@/features/product/types/product-comment/create-product-comment.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useCreateProductComment(
  productId: string,
  onSuccessCallback?: (res: CreateProductCommentResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductCommentResponse,
    ApiResponseError,
    CreateProductCommentBody
  >({
    mutationFn: async (
      body,
    ): Promise<CreateProductCommentResponse> => {
      return await productCommentApi.createProductComment(productId, body);
    },

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: productCommentKeys.list(productId),
      });

      onSuccessCallback?.(response);
    },

    onError: (err: ApiResponseError) => {
      const code = err.errorCode;

      const message =
        (code && CREATE_PRODUCT_COMMENT_ERROR_MESSAGES[code]) ??
        CREATE_PRODUCT_COMMENT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}