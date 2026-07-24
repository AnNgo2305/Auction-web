import { z } from 'zod';
import {
  MAX_PRODUCT_DOCUMENTS,
  MAX_PRODUCT_IMAGES,
  PRODUCT_STATUSES,
  PUBLIC_CATEGORIES,
} from '@/shared/types/product';

export const createProductImageSchema = z.object({
  imageKey: z
    .string({
      error: 'Image key must be a string',
    })
    .trim()
    .min(1, 'Image key is required'),

  isPrimary: z.boolean({
    error: 'isPrimary must be a boolean',
  }),
});

export type CreateProductImageBody = z.infer<
  typeof createProductImageSchema
>;

export const createProductDocumentSchema = z.object({
  documentName: z
    .string({
      error: 'Document name must be a string',
    })
    .trim()
    .min(1, 'Document name is required')
    .max(255, 'Document name must not exceed 255 characters'),

  documentKey: z
    .string({
      error: 'Document key must be a string',
    })
    .trim()
    .min(1, 'Document key is required'),
});

export type CreateProductDocumentBody = z.infer<
  typeof createProductDocumentSchema
>;

export const createProductSchema = z.object({
  name: z
    .string({
      error: 'Product name must be a string',
    })
    .trim()
    .min(1, 'Product name is required')
    .max(255, 'Product name must not exceed 255 characters'),

  description: z.string().optional(),

  stockQuantity: z
    .number({
      error: 'Stock quantity must be a number',
    })
    .int('Stock quantity must be an integer')
    .min(0, 'Stock quantity must be greater than or equal to 0'),

  publicCategory: z.enum(PUBLIC_CATEGORIES, {
    error: 'Invalid public category',
  }),

  categoryIds: z
    .array(
      z.string({
        error: 'Each category ID must be a string',
      }),
      {
        error: 'Category IDs must be an array',
      },
    )
    .optional(),

  status: z.enum(PRODUCT_STATUSES, {
    error: 'Invalid product status',
  }),

  images: z
    .array(createProductImageSchema, {
      error: 'Images must be an array',
    })
    .min(1, 'At least one product image is required')
    .max(
      MAX_PRODUCT_IMAGES,
      `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
    ),

  documents: z
    .array(createProductDocumentSchema, {
      error: 'Documents must be an array',
    })
    .max(
      MAX_PRODUCT_DOCUMENTS,
      `A product can have at most ${MAX_PRODUCT_DOCUMENTS} documents`,
    )
    .optional(),
});

export type CreateProductBody = z.infer<typeof createProductSchema>;