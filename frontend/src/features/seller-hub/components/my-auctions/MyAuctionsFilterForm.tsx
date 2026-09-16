import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group.tsx';
import {
  ArrowDownUp,
  ArrowUpDown,
  CalendarDays,
  CircleCheck,
  Search,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/shared/ui/select.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover.tsx';
import { Button } from '@/shared/ui/button.tsx';
import { Input } from '@/shared/ui/input.tsx';
import { type AuctionStatus } from '@/shared/types/auction-status.ts';
import { AuctionSortBy, AuctionSortOrder } from '@/shared/types/auction.ts';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import { Calendar } from '@/shared/ui/calendar.tsx';
import {
  auctionSortFieldOptions,
  auctionSortOrderOptions,
  auctionStatusOptions,
} from '@/features/seller-hub/constants/auction-filter-options.ts';
import type { DateRange } from 'react-day-picker';

type MyAuctionsFilterValues = {
  keyword: string;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: DateRange;
  sortBy: AuctionSortBy;
  sortOrder: AuctionSortOrder;
};

type MyAuctionsFilterProps = {
  filters: MyAuctionsFilterValues;
  onFilterChange: <K extends keyof MyAuctionsFilterValues>(
    key: K,
    value: MyAuctionsFilterValues[K],
  ) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
};

export function MyAuctionsFilterForm({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: MyAuctionsFilterProps) {
  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      <InputGroup className="bg-background h-11 w-full max-w-10/12 rounded-lg border shadow-sm">
        <InputGroupAddon>
          <Search className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={filters.keyword}
          onChange={(e) => onFilterChange('keyword', e.target.value)}
          placeholder="Search auctions by title..."
          className="placeholder:text-muted-foreground text-sm"
        />
      </InputGroup>
      <div className="bg-muted/20 flex flex-wrap items-center gap-3 rounded-lg">
        <Select
          value={filters.status ?? ''}
          onValueChange={(value) =>
            onFilterChange('status', value as AuctionStatus)
          }
        >
          <SelectTrigger className="bg-background h-10 w-40">
            <CircleCheck className="text-muted-foreground size-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {auctionStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={0}
          value={filters.minPrice ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            onFilterChange(
              'minPrice',
              value === '' ? undefined : Number(value),
            );
          }}
          placeholder="Min price"
          className="bg-background h-10 w-36"
        />
        <Input
          type="number"
          min={0}
          value={filters.maxPrice ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            onFilterChange(
              'maxPrice',
              value === '' ? undefined : Number(value),
            );
          }}
          placeholder="Max price"
          className="bg-background h-10 w-36"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-background h-10 w-72 justify-start text-left font-normal"
            >
              <CalendarDays className="mr-2 size-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {formatIsoToDate(filters.dateRange.from.toISOString())}
                    {' - '}
                    {formatIsoToDate(filters.dateRange.to.toISOString())}
                  </>
                ) : (
                  formatIsoToDate(filters.dateRange.from.toISOString())
                )
              ) : (
                'Select start time range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="px-4 pt-4">
              <h4 className="text-sm font-medium">Select start time range</h4>
              <p className="text-muted-foreground text-xs">
                Filter auctions by start time
              </p>
            </div>
            <Calendar
              mode="range"
              selected={filters.dateRange}
              onSelect={(value) => onFilterChange('dateRange', value)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onFilterChange('sortBy', value as AuctionSortBy)
          }
        >
          <SelectTrigger className="bg-background h-10 w-44">
            <ArrowUpDown className="text-muted-foreground size-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {auctionSortFieldOptions.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.sortOrder}
          onValueChange={(value) =>
            onFilterChange('sortOrder', value as AuctionSortOrder)
          }
        >
          <SelectTrigger className="bg-background h-10 w-44">
            <ArrowDownUp className="text-muted-foreground size-4" />
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {auctionSortOrderOptions.map((order) => (
              <SelectItem key={order.value} value={order.value}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleClearFilters}>
            Clear
          </Button>
          <Button type="button" onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
