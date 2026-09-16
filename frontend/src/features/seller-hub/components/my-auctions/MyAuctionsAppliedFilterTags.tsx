import { X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Badge } from '@/shared/ui/badge.tsx';
import { Button } from '@/shared/ui/button.tsx';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import type { AuctionStatus } from '@/shared/types/auction-status.ts';
import { auctionStatusOptions } from '@/features/seller-hub/constants/auction-filter-options.ts';

type MyAuctionsAppliedFilterTagsProps = {
  keyword?: string;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: DateRange;
  onClearFilters: () => void;
};

export function MyAuctionsAppliedFilterTags({
  keyword,
  status,
  minPrice,
  maxPrice,
  dateRange,
  onClearFilters,
}: MyAuctionsAppliedFilterTagsProps) {
  const hasFilters =
    Boolean(keyword) ||
    Boolean(status) ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    Boolean(dateRange?.from);

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="bg-muted/20 flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {keyword && (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            Search: {keyword}
          </Badge>
        )}

        {status && (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-100"
          >
            Status:{' '}
            {auctionStatusOptions.find((item) => item.value === status)?.label}
          </Badge>
        )}

        {minPrice !== undefined && (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 hover:bg-purple-100"
          >
            Min Price: {minPrice.toLocaleString()}
          </Badge>
        )}

        {maxPrice !== undefined && (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 hover:bg-purple-100"
          >
            Max Price: {maxPrice.toLocaleString()}
          </Badge>
        )}

        {dateRange?.from && (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 hover:bg-orange-100"
          >
            Start Time: {formatIsoToDate(dateRange.from.toISOString())}
            {dateRange.to &&
              ` - ${formatIsoToDate(dateRange.to.toISOString())}`}
          </Badge>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={onClearFilters}
      >
        <X className="mr-2 size-4" />
        Clear filters
      </Button>
    </div>
  );
}
