import { z } from 'zod';
import {
  ProductSortBy,
  SortOrder,
  PUBLIC_CATEGORIES,
  PRODUCT_STATUSES,
} from '@/shared/types/product';

export const getMyProductsQuerySchema = z.object({
  keyword: z.string().optional(),

  status: z
    .enum(PRODUCT_STATUSES, {
      error: 'Invalid product status.',
    })
    .optional(),

  publicCategory: z
    .enum(PUBLIC_CATEGORIES, {
      error: 'Invalid public category.',
    })
    .optional(),

  categoryIds: z
    .string()
    .transform((value) => value.split(','))
    .pipe(
      z.array(
        z.uuid({
          message: 'Category ID must be a valid UUID.',
        }),
      ),
    )
    .optional(),

  createdAtFrom: z.coerce
    .date({
      error: 'Created from must be a valid date.',
    })
    .optional(),

  createdAtTo: z.coerce
    .date({
      error: 'Created to must be a valid date.',
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
    .max(100, 'Limit cannot exceed 100.')
    .default(10),

  sortBy: z
    .enum(ProductSortBy, {
      error: 'Invalid sort field.',
    })
    .default(ProductSortBy.CREATED_AT),

  sortOrder: z
    .enum(SortOrder, {
      error: 'Sort order must be either asc or desc.',
    })
    .default(SortOrder.DESC),
});

export type GetMyProductsQuery = z.infer<typeof getMyProductsQuerySchema>;
