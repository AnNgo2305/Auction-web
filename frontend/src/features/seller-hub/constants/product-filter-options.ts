import {
  PRODUCT_STATUSES,
  ProductSortBy,
  SortOrder,
} from '@/shared/types/product';

export const productStatusOptions = [
  {
    value: PRODUCT_STATUSES.DRAFT,
    label: 'Draft',
  },
  {
    value: PRODUCT_STATUSES.READY,
    label: 'Ready',
  },
  {
    value: PRODUCT_STATUSES.AUCTIONING,
    label: 'Auctioning',
  },
  {
    value: PRODUCT_STATUSES.SOLD,
    label: 'Sold',
  },
  {
    value: PRODUCT_STATUSES.REMOVED,
    label: 'Removed',
  },
];

export const productSortFieldOptions = [
  {
    value: ProductSortBy.CREATED_AT,
    label: 'Created Date',
  },
  {
    value: ProductSortBy.UPDATED_AT,
    label: 'Updated Date',
  },
  {
    value: ProductSortBy.NAME,
    label: 'Name',
  },
  {
    value: ProductSortBy.STOCK_QUANTITY,
    label: 'Stock Quantity',
  },
];

export const productSortOrderOptions = [
  {
    value: SortOrder.DESC,
    label: 'Descending',
  },
  {
    value: SortOrder.ASC,
    label: 'Ascending',
  },
];