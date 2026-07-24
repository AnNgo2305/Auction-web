import { z } from 'zod';

export const deleteProductCategoriesSchema = z.object({
  categoryIds: z
    .array(
      z.uuid({
        message: 'Each category ID must be a valid UUID',
      }),
      {
        error: 'Category IDs must be an array',
      },
    )
    .min(1, 'Category IDs cannot be empty'),
});

export type DeleteProductCategoriesBody = z.infer<
  typeof deleteProductCategoriesSchema
>;
