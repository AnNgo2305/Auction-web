import { z } from 'zod';

export const deleteProductImagesBodySchema = z.object({
  imageIds: z
    .array(
      z.string({
        error: 'Each image ID must be a string.',
      }),
      {
        error: 'Image IDs must be an array.',
      },
    )
    .min(1, 'At least one image ID is required.'),
});

export type DeleteProductImagesBody = z.infer<
  typeof deleteProductImagesBodySchema
>;
