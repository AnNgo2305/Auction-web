import { z } from 'zod';

export const getProductCommentsQuerySchema = z.object({
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
});

export type GetProductCommentsQuery = z.infer<
  typeof getProductCommentsQuerySchema
>;
