import type { GetMyProductsQuery } from '@/features/seller-hub/schemas/product/get-my-products.schema.ts';
import type { GetProductsQuery } from '@/features/product/schemas/product/get-products.schema.ts';

export const productKeys = {
  all: ['products'] as const,

  detail: (productId: string) =>
    [...productKeys.all, 'detail', productId] as const,

  me: () => [...productKeys.all, 'me'] as const,
  myList: (query: GetMyProductsQuery) => [...productKeys.me(), query] as const,

  public: () => [...productKeys.all, 'public'] as const,
  publicList: (query: GetProductsQuery) =>
    [...productKeys.public(), query] as const,
} as const;
