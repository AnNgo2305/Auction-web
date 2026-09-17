export const SELLER_HUB_ROUTES = {
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product-categories',
  CREATE_PRODUCT: 'create',
  AUCTIONS: 'auctions',
  CREATE_AUCTION: 'create',
} as const;

export const sellerHubPaths = {
  products: () => `/sellerhub/${SELLER_HUB_ROUTES.PRODUCTS}`,
  productCategories: () => `/sellerhub/${SELLER_HUB_ROUTES.PRODUCT_CATEGORIES}`,
  createProduct: () =>
    `/sellerhub/${SELLER_HUB_ROUTES.PRODUCTS}/${SELLER_HUB_ROUTES.CREATE_PRODUCT}`,
  auctions: () => `/sellerhub/${SELLER_HUB_ROUTES.AUCTIONS}`,
  createAuction: () =>
    `/sellerhub/${SELLER_HUB_ROUTES.AUCTIONS}/${SELLER_HUB_ROUTES.CREATE_AUCTION}`,
} as const;
