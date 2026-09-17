import { X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge.tsx';
import { Button } from '@/shared/ui/button.tsx';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import {
  auctionSortFieldOptions,
  auctionSortOrderOptions,
  publicAuctionStatusOptions,
} from '@/features/auction/constants/auction-filter-options.ts';
import { AuctionSortBy, AuctionSortOrder } from '@/shared/types/auction.ts';
import type { PublicAuctionStatus } from '@/shared/types/auction-status.ts';
import type { DateRange } from 'react-day-picker';

type AuctionFilterValues = {
  keyword: string;
  status?: PublicAuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: DateRange;
  sortBy: AuctionSortBy;
  sortOrder: AuctionSortOrder;
};

type AuctionAppliedFilterTagsProps = {
  filters: AuctionFilterValues;
  onRemoveFilter: <K extends keyof AuctionFilterValues>(key: K) => void;
  onClearFilters: () => void;
};

export function AuctionsAppliedFilterTags({
  filters,
  onRemoveFilter,
  onClearFilters,
}: AuctionAppliedFilterTagsProps) {
  const statusLabel = publicAuctionStatusOptions.find(
    (status) => status.value === filters.status,
  )?.label;

  const sortByLabel = auctionSortFieldOptions.find(
    (field) => field.value === filters.sortBy,
  )?.label;

  const sortOrderLabel = auctionSortOrderOptions.find(
    (order) => order.value === filters.sortOrder,
  )?.label;

  const hasDateRange = Boolean(filters.dateRange?.from);

  const hasFilters =
    Boolean(filters.keyword) ||
    filters.status !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    hasDateRange;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.keyword && (
        <Badge variant="secondary" className="gap-1">
          Search: {filters.keyword}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('keyword')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {filters.status && statusLabel && (
        <Badge variant="secondary" className="gap-1">
          Status: {statusLabel}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('status')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {filters.minPrice !== undefined && (
        <Badge variant="secondary" className="gap-1">
          Min: {filters.minPrice.toLocaleString()} ₫
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('minPrice')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {filters.maxPrice !== undefined && (
        <Badge variant="secondary" className="gap-1">
          Max: {filters.maxPrice.toLocaleString()} ₫
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('maxPrice')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {hasDateRange && (
        <Badge variant="secondary" className="gap-1">
          Start:{' '}
          {filters.dateRange?.from &&
            formatIsoToDate(filters.dateRange.from.toISOString())}
          {filters.dateRange?.to && (
            <>
              {' - '}
              {formatIsoToDate(filters.dateRange.to.toISOString())}
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('dateRange')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {sortByLabel && (
        <Badge variant="secondary" className="gap-1">
          Sort: {sortByLabel}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('sortBy')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      {sortOrderLabel && (
        <Badge variant="secondary" className="gap-1">
          Order: {sortOrderLabel}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter('sortOrder')}
          >
            <X className="size-3" />
          </Button>
        </Badge>
      )}

      <Button type="button" variant="ghost" size="sm" onClick={onClearFilters}>
        Clear all
      </Button>
    </div>
  );
}
