export const PRODUCT_ROUTES = {
  LIST: '',
  DETAIL: ':productId',
} as const;

export const productPaths = {
  list: () => '/products',
  detail: (productId: string) => `/products/${productId}`,
} as const;
