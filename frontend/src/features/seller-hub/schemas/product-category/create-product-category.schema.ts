import { z } from 'zod';

export const createProductCategorySchema = z.object({
  name: z
    .string({
      error: 'Category name must be a string',
    })
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),

  color: z
    .string({
      error: 'Category color must be a string',
    })
    .regex(/^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, {
      message: 'Category color must be a valid hex color',
    })
    .optional(),
});

export type CreateProductCategoryBody = z.infer<
  typeof createProductCategorySchema
>;
