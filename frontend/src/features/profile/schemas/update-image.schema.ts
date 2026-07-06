import { z } from 'zod';

export const updateImageSchema = z.object({
  imageKey: z
    .string({
      error: 'imageKey must be a string',
    })
    .min(1, 'imageKey is required'),
});

export type UpdateImageBody = z.infer<typeof updateImageSchema>;
