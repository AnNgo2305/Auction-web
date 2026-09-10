import { z } from 'zod';

export const createAuctionProductSchema = z.object({
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

export type CreateAuctionProductBody = z.infer<
  typeof createAuctionProductSchema
>;

export const createAuctionSchema = z.object({
  title: z
    .string({
      error: 'Auction title must be a string',
    })
    .trim()
    .min(1, 'Auction title is required')
    .max(255, 'Auction title must not exceed 255 characters'),

  startTime: z
    .string({
      error: 'Start time must be a string',
    })
    .pipe(z.iso.datetime('Start time must be a valid ISO datetime string')),

  endTime: z
    .string({
      error: 'End time must be a string',
    })
    .pipe(z.iso.datetime('End time must be a valid ISO datetime string')),

  startingPrice: z
    .number({
      error: 'Starting price must be a number',
    })
    .min(0, 'Starting price must be greater than or equal to 0'),

  minimumBidIncrement: z
    .number({
      error: 'Minimum bid increment must be a number',
    })
    .min(0, 'Minimum bid increment must be greater than or equal to 0'),

  auctionProducts: z
    .array(createAuctionProductSchema, {
      error: 'Auction products must be an array',
    })
    .min(1, 'At least one auction product is required'),
});

export type CreateAuctionBody = z.infer<typeof createAuctionSchema>;
