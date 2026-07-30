import { z } from 'zod';
import { MAX_PRODUCT_DOCUMENTS } from '@/shared/types/product';

export const productDocumentSchema = z.object({
  documentName: z
    .string({
      error: 'Document name must be a string.',
    })
    .min(1, 'Document name is required.')
    .max(255, 'Document name must not exceed 255 characters.'),

  documentKey: z
    .string({
      error: 'Document key must be a string.',
    })
    .min(1, 'Document key is required.')
    .max(255, 'Document key must not exceed 255 characters.'),
});

export const updateProductDocumentsSchema = z.object({
  documents: z
    .array(productDocumentSchema, {
      error: 'Documents must be an array.',
    })
    .max(
      MAX_PRODUCT_DOCUMENTS,
      `A product can have at most ${MAX_PRODUCT_DOCUMENTS} documents.`,
    ),
});

export type ProductDocumentBody = z.infer<typeof productDocumentSchema>;

export type UpdateProductDocumentsBody = z.infer<
  typeof updateProductDocumentsSchema
>;
