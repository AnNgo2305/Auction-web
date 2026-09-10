import { z } from 'zod';

export const cancelAuctionSchema = z.object({
  cancelReason: z
    .string({
      error: 'Cancel reason must be a string.',
    })
    .trim()
    .min(1, 'Cancel reason is required.')
    .max(1000, 'Cancel reason must not exceed 1000 characters.'),
});

export type CancelAuctionBody = z.infer<typeof cancelAuctionSchema>;
