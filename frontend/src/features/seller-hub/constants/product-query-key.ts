import type { GetMyProductsQuery } from '@/features/seller-hub/schemas/product/get-my-products.schema.ts';

export const productKeys = {
  all: ['products'] as const,

  me: () => [...productKeys.all, 'me'] as const,

  myList: (query: GetMyProductsQuery) => [...productKeys.me(), query] as const,
} as const;
