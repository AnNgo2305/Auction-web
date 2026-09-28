import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useGetAuctionBids } from '@/features/bid/hooks/useGetAuctionBids.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar.tsx';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';

type AuctionBidHistoryProps = {
  auctionId: string;
};

const BID_SKELETON_COUNT = 5;

export function AuctionBidHistory({ auctionId }: AuctionBidHistoryProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetAuctionBids(auctionId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef(0);

  const pages = data?.pages ?? [];

  // API returns newest -> oldest.
  // Reverse each page so the UI displays oldest -> newest.
  const bids = pages.flatMap((page) => [...page.data.bids].reverse()).reverse();

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const container = scrollContainerRef.current;

          if (container) {
            previousScrollHeightRef.current = container.scrollHeight;
          }

          void fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container || previousScrollHeightRef.current === 0) {
      return;
    }

    if (isFetchingNextPage) {
      return;
    }

    const previousScrollHeight = previousScrollHeightRef.current;
    const newScrollHeight = container.scrollHeight;
    const heightDifference = newScrollHeight - previousScrollHeight;

    container.scrollTop += heightDifference;

    previousScrollHeightRef.current = 0;
  }, [bids.length, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="font-semibold">Bid History</h3>
          <p className="text-muted-foreground text-sm">
            Recent bids on this auction
          </p>
        </div>

        <div className="space-y-4">
          {Array.from({ length: BID_SKELETON_COUNT }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>

              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="font-semibold">Bid History</h3>
          <p className="text-muted-foreground text-sm">
            Recent bids on this auction
          </p>
        </div>

        <div className="text-muted-foreground py-6 text-center text-sm">
          No bids yet.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="mb-4">
        <h3 className="font-semibold">Bid History</h3>
        <p className="text-muted-foreground text-sm">
          Recent bids on this auction
        </p>
      </div>

      <div ref={scrollContainerRef} className="max-h-100 overflow-y-auto">
        <div className="space-y-4">
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex h-6 items-center justify-center"
            >
              {isFetchingNextPage && (
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              )}
            </div>
          )}

          {bids.map((bid) => (
            <div key={bid.bidId} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={bid.profileImageUrl ?? defaultAvatarImageUrl}
                  alt="Bidder avatar"
                />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{bid.username}</p>

                <p className="text-muted-foreground text-xs">
                  {new Date(bid.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="font-semibold">{bid.bidAmount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
