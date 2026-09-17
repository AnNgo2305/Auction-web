import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuctionCard } from '@/features/auction/components/auction-gallery/AuctionCard';
import { AuctionsFilterForm } from '@/features/auction/components/auction-gallery/AuctionsFilterForm';
import { AuctionsAppliedFilterTags } from '@/features/auction/components/auction-gallery/AuctionsAppliedFilterTags';
import { AuctionsPagination } from '@/features/auction/components/auction-gallery/AuctionsPagination';
import { useSearchAuctions } from '@/features/auction/hooks/useSearchAuctions';
import {
  AuctionSortBy,
  AuctionSortOrder,
} from '@/shared/types/auction';
import type { PublicAuctionStatus } from '@/shared/types/auction-status';
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

const defaultFilters: AuctionFilterValues = {
  keyword: '',
  status: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  dateRange: undefined,
  sortBy: AuctionSortBy.CREATED_AT,
  sortOrder: AuctionSortOrder.DESC,
};

export function AuctionGalleryPage() {
  const [filters, setFilters] =
    useState<AuctionFilterValues>(defaultFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<AuctionFilterValues>(defaultFilters);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      keyword: appliedFilters.keyword || undefined,
      status: appliedFilters.status,
      minPrice: appliedFilters.minPrice,
      maxPrice: appliedFilters.maxPrice,
      startTimeFrom: appliedFilters.dateRange?.from?.toISOString(),
      startTimeTo: appliedFilters.dateRange?.to?.toISOString(),
      sortBy: appliedFilters.sortBy,
      sortOrder: appliedFilters.sortOrder,
      limit,
    }),
    [appliedFilters, limit],
  );

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSearchAuctions(query);

  const loadedPageCount = data?.pages.length ?? 0;

  const auctions = data?.pages[page - 1]?.data.data ?? [];

  const handleFilterChange = <
    K extends keyof AuctionFilterValues,
  >(
    key: K,
    value: AuctionFilterValues[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const handleRemoveFilter = <K extends keyof AuctionFilterValues>(
    key: K,
  ) => {
    const nextFilters = {
      ...appliedFilters,
      [key]: undefined,
    };

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < loadedPageCount) {
      setPage((current) => current + 1);
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
      setPage((current) => current + 1);
    }
  };

  const handlePreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage <= loadedPageCount) {
      setPage(nextPage);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auctions</h1>
        <p className="text-muted-foreground text-sm">
          Browse and discover active auctions.
        </p>
      </div>

      <AuctionsFilterForm
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <AuctionsAppliedFilterTags
        filters={appliedFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <div className="flex min-h-80 items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex min-h-80 items-center justify-center">
          <p className="text-muted-foreground">Failed to load auctions.</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex min-h-80 items-center justify-center">
          <p className="text-muted-foreground">No auctions found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction.auctionId} auction={auction} />
          ))}
        </div>
      )}

      {!isLoading && !isError && auctions.length > 0 && (
        <AuctionsPagination
          page={page}
          loadedPageCount={loadedPageCount}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          limit={limit}
          onPageChange={handlePageChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onLimitChange={handleLimitChange}
        />
      )}
    </div>
  );
}