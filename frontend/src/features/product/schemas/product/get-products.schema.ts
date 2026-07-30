import { z } from 'zod';
import {
  ProductSortBy,
  SortOrder,
  PUBLIC_CATEGORIES,
  PUBLIC_PRODUCT_STATUSES,
} from '@/shared/types/product.ts';

export const getProductsSchema = z.object({
  keyword: z.string().optional(),

  publicCategory: z
    .enum(PUBLIC_CATEGORIES, {
      error: 'Invalid public category.',
    })
    .optional(),

  status: z
    .enum(PUBLIC_PRODUCT_STATUSES, {
      error: 'Invalid product status.',
    })
    .optional(),

  cursor: z
    .uuid({
      message: 'Cursor must be a valid UUID.',
    })
    .optional(),

  limit: z.coerce
    .number({
      error: 'Limit must be a number.',
    })
    .int('Limit must be an integer.')
    .min(1, 'Limit must be at least 1.')
    .max(100, 'Limit must not exceed 100.')
    .default(10),

  sortBy: z
    .enum(ProductSortBy, {
      error: 'Invalid sortBy value.',
    })
    .default(ProductSortBy.CREATED_AT),

  sortOrder: z
    .enum(SortOrder, {
      error: 'Invalid sortOrder value.',
    })
    .default(SortOrder.DESC),
});

export type GetProductsQuery = z.infer<typeof getProductsSchema>;
