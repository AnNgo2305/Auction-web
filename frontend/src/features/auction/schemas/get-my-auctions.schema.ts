import { z } from 'zod';
import { AuctionSortBy, AuctionSortOrder } from '@/shared/types/auction';
import { AUCTION_STATUSES } from '@/shared/types/auction-status';

export const getMyAuctionsSchema = z.object({
  keyword: z.string().optional(),

  status: z
    .enum(AUCTION_STATUSES, {
      error: 'Invalid auction status.',
    })
    .optional(),

  minPrice: z.coerce
    .number({
      error: 'Minimum price must be a number.',
    })
    .min(0, 'Minimum price must be greater than or equal to 0.')
    .optional(),

  maxPrice: z.coerce
    .number({
      error: 'Maximum price must be a number.',
    })
    .min(0, 'Maximum price must be greater than or equal to 0.')
    .optional(),

  startTimeFrom: z.iso
    .datetime({
      error: 'Start time from must be a valid ISO datetime string.',
    })
    .optional(),

  startTimeTo: z.iso
    .datetime({
      error: 'Start time to must be a valid ISO datetime string.',
    })
    .optional(),

  cursor: z
    .uuid({
      message: 'Cursor must be a valid UUID.',
    })
    .optional(),

  limit: z.coerce
    .number({
      error: 'Limit must be a number.',
    })
    .int('Limit must be an integer.')
    .min(1, 'Limit must be at least 1.')
    .max(100, 'Limit must not exceed 100.')
    .default(10),

  sortBy: z
    .enum(AuctionSortBy, {
      error: 'Invalid sortBy value.',
    })
    .default(AuctionSortBy.CREATED_AT),

  sortOrder: z
    .enum(AuctionSortOrder, {
      error: 'Invalid sortOrder value.',
    })
    .default(AuctionSortOrder.DESC),
});

export type GetMyAuctionsQuery = z.infer<typeof getMyAuctionsSchema>;
