import { z } from 'zod';
import { MAX_PRODUCT_IMAGES } from '@/shared/types/product';

export const productImageSchema = z.object({
  imageKey: z.string({
    error: 'Image key must be a string.',
  }),

  isPrimary: z.boolean({
    error: 'Primary flag must be a boolean.',
  }),
});

export const updateProductImagesBodySchema = z.object({
  images: z
    .array(productImageSchema, {
      error: 'Images must be an array.',
    })
    .min(1, 'At least one image is required.')
    .max(
      MAX_PRODUCT_IMAGES,
      `A product can have at most ${MAX_PRODUCT_IMAGES} images.`,
    ),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export type UpdateProductImagesBody = z.infer<
  typeof updateProductImagesBodySchema
>;
