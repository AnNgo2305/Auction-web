export const MAX_PRODUCT_DOCUMENTS = 10;
export const MAX_PRODUCT_IMAGES = 10;

export enum PRODUCT_STATUSES {
  DRAFT = 'DRAFT',
  READY = 'READY',
  AUCTIONING = 'AUCTIONING',
  SOLD = 'SOLD',
  REMOVED = 'REMOVED',
}

export type ProductStatus =
  (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export enum PUBLIC_CATEGORIES {
  ELECTRONICS = 'ELECTRONICS',
  COMPUTERS = 'COMPUTERS',
  PHONES = 'PHONES',
  CAMERAS = 'CAMERAS',
  FASHION = 'FASHION',
  JEWELRY = 'JEWELRY',
  WATCHES = 'WATCHES',
  HOME = 'HOME',
  FURNITURE = 'FURNITURE',
  BOOKS = 'BOOKS',
  ART = 'ART',
  TOYS = 'TOYS',
  FIGURES = 'FIGURES',
  COLLECTIBLES = 'COLLECTIBLES',
  ANTIQUES = 'ANTIQUES',
  SPORTS = 'SPORTS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  MUSICAL_INSTRUMENTS = 'MUSICAL_INSTRUMENTS',
  OTHER = 'OTHER',
}

export type PublicCategory =
  (typeof PUBLIC_CATEGORIES)[keyof typeof PUBLIC_CATEGORIES];

export const ProductSortBy = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  NAME: 'name',
  STOCK_QUANTITY: 'stockQuantity',
} as const;

export type ProductSortBy = (typeof ProductSortBy)[keyof typeof ProductSortBy];

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export const PRODUCT_STATUS_ACTIONS = {
  PUBLISH: 'publish',
  RESTORE: 'restore',
  REMOVE: 'remove',
} as const;

export type ProductStatusAction =
  (typeof PRODUCT_STATUS_ACTIONS)[keyof typeof PRODUCT_STATUS_ACTIONS];

export const PUBLIC_PRODUCT_STATUSES = {
  READY: PRODUCT_STATUSES.READY,
  AUCTIONING: PRODUCT_STATUSES.AUCTIONING,
} as const;

export type PublicProductStatus =
  (typeof PUBLIC_PRODUCT_STATUSES)[keyof typeof PUBLIC_PRODUCT_STATUSES];
