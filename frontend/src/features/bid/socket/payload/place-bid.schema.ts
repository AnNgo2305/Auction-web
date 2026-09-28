import { z } from 'zod';

export const placeBidSchema = z.object({
  auctionId: z.uuid(),
  tempId: z.uuid(),
  bidAmount: z
    .number({
      message: 'Bid amount must be a number',
    })
    .min(0, {
      message: 'Bid amount must be greater than or equal to 0',
    }),
});

export type PlaceBidFormValues = z.infer<typeof placeBidSchema>;
