export const productCommentKeys = {
  all: ['product-comments'] as const,

  product: (productId: string) =>
    [...productCommentKeys.all, productId] as const,

  list: (productId: string) =>
    [...productCommentKeys.product(productId), 'list'] as const,
} as const;
