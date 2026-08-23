import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productCommentApi } from '@/features/product/api/product-comment.api';
import { productCommentKeys } from '@/features/product/constants/product-comment-query-key';
import { DELETE_PRODUCT_COMMENT_ERROR_MESSAGES } from '@/features/product/constants/product-comment-error.messages';
import type { DeleteProductCommentResponse } from '@/features/product/types/product-comment/delete-product-comment.response';
import type { ApiResponseError } from '@/shared/types/error';

export function useDeleteProductComment(
  productId: string,
  onSuccessCallback?: (res: DeleteProductCommentResponse) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteProductCommentResponse,
    ApiResponseError,
    { commentId: string }
  >({
    mutationFn: async ({
      commentId,
    }): Promise<DeleteProductCommentResponse> => {
      return await productCommentApi.deleteProductComment(productId, commentId);
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
        (code && DELETE_PRODUCT_COMMENT_ERROR_MESSAGES[code]) ??
        DELETE_PRODUCT_COMMENT_ERROR_MESSAGES.DEFAULT;

      toast.error(message);
    },
  });
}
