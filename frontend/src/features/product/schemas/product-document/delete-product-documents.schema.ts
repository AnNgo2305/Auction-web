import { z } from 'zod';
import { MAX_PRODUCT_DOCUMENTS } from '@/shared/types/product';

export const deleteProductDocumentsSchema = z.object({
  documentIds: z
    .array(
      z.uuid({
        message: 'Each document ID must be a valid UUID.',
      }),
      {
        error: 'Document IDs must be an array.',
      },
    )
    .min(1, 'At least one document ID is required.')
    .max(
      MAX_PRODUCT_DOCUMENTS,
      `A maximum of ${MAX_PRODUCT_DOCUMENTS} document IDs can be deleted at once.`,
    ),
});

export type DeleteProductDocumentsBody = z.infer<
  typeof deleteProductDocumentsSchema
>;
