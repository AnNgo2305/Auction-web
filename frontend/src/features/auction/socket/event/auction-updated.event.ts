import type { PublicAuctionStatus } from '@/shared/types/auction-status.ts';

export type AuctionUpdatedEvent = {
  auctionId: string;
  currentPrice?: number;
  bidCount?: number;
  status?: PublicAuctionStatus;
  endTime?: string;
};
