export const SELLER_HUB_ROUTES = {
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product-categories',
} as const;

export const sellerHubPaths = {
  products: () => '/sellerhub/products',
  productCategories: () => '/sellerhub/product-categories',
} as const;
