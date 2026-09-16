import { AuctionSortBy, AuctionSortOrder } from '@/shared/types/auction';
import { AUCTION_STATUSES } from '@/shared/types/auction-status';

export const auctionStatusOptions = [
  {
    value: AUCTION_STATUSES.PENDING,
    label: 'Pending',
  },
  {
    value: AUCTION_STATUSES.READY,
    label: 'Ready',
  },
  {
    value: AUCTION_STATUSES.OPEN,
    label: 'Open',
  },
  {
    value: AUCTION_STATUSES.CLOSED,
    label: 'Closed',
  },
  {
    value: AUCTION_STATUSES.CANCELED,
    label: 'Canceled',
  },
  {
    value: AUCTION_STATUSES.COMPLETED,
    label: 'Completed',
  },
  {
    value: AUCTION_STATUSES.EXTENDED,
    label: 'Extended',
  },
];

export const auctionSortFieldOptions = [
  {
    value: AuctionSortBy.CREATED_AT,
    label: 'Created Date',
  },
  {
    value: AuctionSortBy.END_TIME,
    label: 'End Time',
  },
  {
    value: AuctionSortBy.CURRENT_PRICE,
    label: 'Current Price',
  },
  {
    value: AuctionSortBy.BID_COUNT,
    label: 'Bid Count',
  },
];

export const auctionSortOrderOptions = [
  {
    value: AuctionSortOrder.DESC,
    label: 'Descending',
  },
  {
    value: AuctionSortOrder.ASC,
    label: 'Ascending',
  },
];
