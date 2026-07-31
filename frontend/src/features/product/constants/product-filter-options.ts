import {
  PUBLIC_PRODUCT_STATUSES,
  PublicProductSortBy,
  SortOrder,
} from '@/shared/types/product';

export const publicProductStatusOptions = [
  {
    value: PUBLIC_PRODUCT_STATUSES.READY,
    label: 'Ready',
  },
  {
    value: PUBLIC_PRODUCT_STATUSES.AUCTIONING,
    label: 'Auctioning',
  },
];

export const publicProductSortFieldOptions = [
  {
    value: PublicProductSortBy.CREATED_AT,
    label: 'Created Date',
  },
  {
    value: PublicProductSortBy.UPDATED_AT,
    label: 'Updated Date',
  },
  {
    value: PublicProductSortBy.NAME,
    label: 'Name',
  },
];

export const publicProductSortOrderOptions = [
  {
    value: SortOrder.ASC,
    label: 'Ascending',
  },
  {
    value: SortOrder.DESC,
    label: 'Descending',
  },
];
