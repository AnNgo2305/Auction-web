import { z } from 'zod';

export const createProductCommentBodySchema = z.object({
  content: z
    .string({
      error: 'Content must be a string.',
    })
    .max(2000, 'Content must not exceed 2000 characters.'),

  rating: z.coerce
    .number({
      error: 'Rating must be a number.',
    })
    .int('Rating must be an integer.')
    .min(1, 'Rating must be at least 1.')
    .max(5, 'Rating must not exceed 5.')
    .optional(),
});

export type CreateProductCommentBody = z.infer<
  typeof createProductCommentBodySchema
>;
