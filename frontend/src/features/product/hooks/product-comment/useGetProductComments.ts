import { useInfiniteQuery } from '@tanstack/react-query';
import { productCommentApi } from '@/features/product/api/product-comment.api';
import { productCommentKeys } from '@/features/product/constants/product-comment-query-key';

const DEFAULT_LIMIT = 10;

export function useGetProductComments(
  productId: string,
  limit: number = DEFAULT_LIMIT,
) {
  return useInfiniteQuery({
    queryKey: productCommentKeys.list(productId),
    queryFn: async ({ pageParam }) => {
      return await productCommentApi.getProductComments(productId, {
        limit,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: !!productId,
    staleTime: 1000 * 30,
    select: ({ pages }) => ({
      comments: pages.flatMap((page) => page.data.comments),
    }),
  });
}
