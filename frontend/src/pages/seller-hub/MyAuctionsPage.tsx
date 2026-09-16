import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  type AuctionSortBy,
  type AuctionSortOrder,
} from '@/shared/types/auction';
import type { AuctionStatus } from '@/shared/types/auction-status.ts';
import { MyAuctionsFilterForm } from '@/features/seller-hub/components/my-auctions/MyAuctionsFilterForm.tsx';
import { MyAuctionsAppliedFilterTags } from '@/features/seller-hub/components/my-auctions/MyAuctionsAppliedFilterTags.tsx';
import { MyAuctionsDataTable } from '@/features/seller-hub/components/my-auctions/MyAuctionsDataTable.tsx';
import { Pagination } from '@/features/seller-hub/components/Pagination.tsx';
import { useCancelAuction } from '@/features/auction/hooks/useCancelAuction.ts';
import { useConfirmAuction } from '@/features/auction/hooks/useConfirmAuction.ts';
import { useEndAuction } from '@/features/auction/hooks/useEndAuction.ts';
import { useGetMyAuctions } from '@/features/auction/hooks/useGetMyAuctions.ts';
import { useResubmitAuction } from '@/features/auction/hooks/useResubmitAuction.ts';
import type { CancelAuctionBody } from '@/features/auction/schemas/cancel-auction.schema';

type AuctionFilters = {
  keyword: string;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: DateRange;
  sortBy: AuctionSortBy;
  sortOrder: AuctionSortOrder;
};

const DEFAULT_FILTERS: AuctionFilters = {
  keyword: '',
  status: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  dateRange: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function MyAuctionsPage() {
  const [filters, setFilters] = useState<AuctionFilters>(DEFAULT_FILTERS);

  const [appliedFilters, setAppliedFilters] =
    useState<AuctionFilters>(DEFAULT_FILTERS);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { mutate: cancelAuction, isPending: isCanceling } = useCancelAuction();
  const { mutate: resubmitAuction, isPending: isResubmitting } =
    useResubmitAuction();
  const { mutate: endAuction, isPending: isEnding } = useEndAuction();
  const { mutate: confirmAuction, isPending: isConfirming } =
    useConfirmAuction();

  const isActionLoading =
    isCanceling || isResubmitting || isEnding || isConfirming;

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: isGetMyAuctionsLoading,
  } = useGetMyAuctions({
    limit,
    keyword: appliedFilters.keyword,
    status: appliedFilters.status,
    minPrice: appliedFilters.minPrice,
    maxPrice: appliedFilters.maxPrice,
    startTimeFrom: appliedFilters.dateRange?.from?.toISOString(),
    startTimeTo: appliedFilters.dateRange?.to?.toISOString(),
    sortBy: appliedFilters.sortBy,
    sortOrder: appliedFilters.sortOrder,
  });

  const auctions = data?.pages.flatMap((page) => page.data.data) ?? [];
  const visibleAuctions = data?.pages[page - 1]?.data.data ?? [];

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleCancel = (auctionId: string, body: CancelAuctionBody) => {
    cancelAuction({
      auctionId,
      body,
    });
  };

  const handleResubmit = (auctionId: string) => {
    resubmitAuction(auctionId);
  };

  const handleEnd = (auctionId: string) => {
    endAuction(auctionId);
  };

  const handleConfirm = (auctionId: string) => {
    confirmAuction(auctionId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auctions</h1>
        <p className="text-muted-foreground text-sm">Manage your auctions.</p>
      </div>

      <MyAuctionsFilterForm
        filters={filters}
        onFilterChange={(key, value) => {
          setFilters((prev) => ({
            ...prev,
            [key]: value,
          }));
        }}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <MyAuctionsAppliedFilterTags
        keyword={filters.keyword}
        status={filters.status}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        dateRange={filters.dateRange}
        onClearFilters={handleClearFilters}
      />

      <MyAuctionsDataTable
        visibleAuctions={visibleAuctions}
        isActionLoading={isActionLoading}
        isLoading={isGetMyAuctionsLoading}
        onCancel={handleCancel}
        onResubmit={handleResubmit}
        onEnd={handleEnd}
        onConfirm={handleConfirm}
      />

      {auctions.length > 0 && (
        <Pagination
          page={page}
          limit={limit}
          loadedPageCount={data?.pages.length ?? 1}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onPreviousPage={() => {
            setPage((prev) => Math.max(prev - 1, 1));
          }}
          onNextPage={async (): Promise<void> => {
            await fetchNextPage();
            setPage((prev) => prev + 1);
          }}
        />
      )}
    </div>
  );
}
