import { z } from 'zod';
import {
  PRODUCT_STATUSES,
  PUBLIC_CATEGORIES,
} from '@/shared/types/product';

export const updateProductSchema = z.object({
  productId: z.uuid({
    message: 'Product ID must be a valid UUID.',
  }),

  name: z
    .string({
      error: 'Product name must be a string.',
    })
    .trim()
    .min(1, 'Product name is required.')
    .max(255, 'Product name must not exceed 255 characters.'),

  description: z.string().optional(),

  stockQuantity: z.coerce
    .number({
      error: 'Stock quantity must be a number.',
    })
    .int('Stock quantity must be an integer.')
    .min(0, 'Stock quantity must be greater than or equal to 0.'),

  status: z.enum(PRODUCT_STATUSES, {
    error: 'Invalid product status.',
  }),

  categoryIds: z
    .array(
      z.string({
        error: 'Each category ID must be a string.',
      }),
      {
        error: 'Category IDs must be an array.',
      },
    )
    .min(1, 'Category IDs cannot be empty.')
    .optional(),

  publicCategory: z.enum(PUBLIC_CATEGORIES, {
    error: 'Invalid public category.',
  }),
});

export type UpdateProductBody = z.infer<typeof updateProductSchema>;
