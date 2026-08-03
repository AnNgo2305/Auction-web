import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productCommentApi } from '@/features/product/api/product-comment.api';
import { productCommentKeys } from '@/features/product/constants/product-comment-query-key';
import { UPDATE_PRODUCT_COMMENT_ERROR_MESSAGES } from '@/features/product/constants/product-comment-error.messages';
import type { UpdateProductCommentBody } from '@/features/product/schemas/product-comment/update-product-comment.schema';
import type { UpdateProductCommentResponse } from '@/features/product/types/product-comment/update-product-comment.response';
import type { ApiResponseError } from '@/shared/types/error';

type UpdateProductCommentVariables = {
  commentId: string;
  body: UpdateProductCommentBody;
};

export function useUpdateProductComment(
  productId: string,
  onSuccessCallback?: (res: UpdateProductCommentResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductCommentResponse,
    ApiResponseError,
    UpdateProductCommentVariables
  >({
    mutationFn: async ({
      commentId,
      body,
    }): Promise<UpdateProductCommentResponse> => {
      return await productCommentApi.updateProductComment(
        productId,
        commentId,
        body,
      );
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
        (code && UPDATE_PRODUCT_COMMENT_ERROR_MESSAGES[code]) ??
        UPDATE_PRODUCT_COMMENT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
