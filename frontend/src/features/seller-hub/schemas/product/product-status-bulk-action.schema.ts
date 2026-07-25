import { z } from 'zod';

export const productStatusBulkActionSchema = z.object({
  productIds: z
    .array(
      z.uuid({
        message: 'Each product ID must be a valid UUID.',
      }),
      {
        error: 'Product IDs must be an array.',
      },
    )
    .min(1, 'Product IDs must not be empty.'),
});

export type ProductStatusBulkActionBody = z.infer<
  typeof productStatusBulkActionSchema
>;
