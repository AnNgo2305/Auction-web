import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { useGetMyBids } from '@/features/bid/hooks/useGetMyBids';
import { Skeleton } from '@/shared/ui/skeleton';
import { MyBidItem } from './MyBidItem';

type MyBidDropdownProps = {
  onClose: () => void;
};

const BID_SKELETON_COUNT = 5;

export function MyBidDropdown({ onClose }: MyBidDropdownProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useGetMyBids();

  const bids = data?.bids ?? [];

  useEffect(() => {
    const observerElement = observerRef.current;

    if (!observerElement || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(observerElement);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div>
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">My Bids</h3>
          <p className="text-muted-foreground text-sm">
            Auctions you have bid on
          </p>
        </div>

        <div className="space-y-4 p-4">
          {Array.from({ length: BID_SKELETON_COUNT }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>

              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div>
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">My Bids</h3>
          <p className="text-muted-foreground text-sm">
            Auctions you have bid on
          </p>
        </div>

        <div className="text-muted-foreground p-6 text-center text-sm">
          You have not placed any bids yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">My Bids</h3>
        <p className="text-muted-foreground text-sm">
          Auctions you have bid on
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {bids.map((bid) => (
          <div key={bid.bidId} onClick={onClose}>
            <MyBidItem bid={bid} />
          </div>
        ))}

        {hasNextPage && (
          <div
            ref={observerRef}
            className="flex h-12 items-center justify-center"
          >
            {isFetchingNextPage && (
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
