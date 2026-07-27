export const SELLER_HUB_ROUTES = {
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product-categories',
} as const;

export const sellerHubPaths = {
  products: () => `/sellerhub/${SELLER_HUB_ROUTES.PRODUCTS}`,
  productCategories: () => `/sellerhub/${SELLER_HUB_ROUTES.PRODUCT_CATEGORIES}`,
} as const;
