import { type PublicAuctionStatus } from '@/shared/types/auction-status.ts';
import { AuctionSortBy, AuctionSortOrder } from '@/shared/types/auction.ts';

export const publicAuctionStatusOptions = [
  {
    value: 'READY' as PublicAuctionStatus,
    label: 'Ready',
  },
  {
    value: 'OPEN' as PublicAuctionStatus,
    label: 'Open',
  },
  {
    value: 'CLOSED' as PublicAuctionStatus,
    label: 'Closed',
  },
  {
    value: 'COMPLETED' as PublicAuctionStatus,
    label: 'Completed',
  },
  {
    value: 'EXTENDED' as PublicAuctionStatus,
    label: 'Extended',
  },
];

export const auctionSortFieldOptions = [
  {
    value: AuctionSortBy.CREATED_AT,
    label: 'Created date',
  },
  {
    value: AuctionSortBy.BID_COUNT,
    label: 'Start time',
  },
  {
    value: AuctionSortBy.END_TIME,
    label: 'End time',
  },
  {
    value: AuctionSortBy.CURRENT_PRICE,
    label: 'Current price',
  },
];

export const auctionSortOrderOptions = [
  {
    value: AuctionSortOrder.ASC,
    label: 'Ascending',
  },
  {
    value: AuctionSortOrder.DESC,
    label: 'Descending',
  },
];
