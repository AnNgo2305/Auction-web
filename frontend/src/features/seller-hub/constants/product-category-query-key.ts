export const productCategoryKeys = {
  all: ['product-categories'] as const,

  me: () => [...productCategoryKeys.all, 'me'] as const,
} as const;
