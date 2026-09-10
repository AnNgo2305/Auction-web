import { z } from 'zod';

export const updateAuctionProductSchema = z.object({
  productId: z
    .string({
      error: 'Product ID must be a string',
    })
    .trim()
    .min(1, 'Product ID is required'),

  quantity: z
    .number({
      error: 'Quantity must be a number',
    })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be greater than or equal to 1'),
});

export type UpdateAuctionProductBody = z.infer<
  typeof updateAuctionProductSchema
>;

export const updateAuctionSchema = z.object({
  title: z
    .string({
      error: 'Auction title must be a string',
    })
    .trim()
    .max(255, 'Auction title must not exceed 255 characters')
    .optional(),

  startTime: z.iso
    .datetime({
      error: 'Start time must be a valid ISO datetime string',
    })
    .optional(),

  endTime: z.iso
    .datetime({
      error: 'End time must be a valid ISO datetime string',
    })
    .optional(),

  startingPrice: z
    .number({
      error: 'Starting price must be a number',
    })
    .min(0, 'Starting price must be greater than or equal to 0')
    .optional(),

  minimumBidIncrement: z
    .number({
      error: 'Minimum bid increment must be a number',
    })
    .min(0, 'Minimum bid increment must be greater than or equal to 0')
    .optional(),

  auctionProducts: z
    .array(updateAuctionProductSchema, {
      error: 'Auction products must be an array',
    })
    .min(1, 'At least one auction product is required')
    .optional(),
});

export type UpdateAuctionBody = z.infer<typeof updateAuctionSchema>;
