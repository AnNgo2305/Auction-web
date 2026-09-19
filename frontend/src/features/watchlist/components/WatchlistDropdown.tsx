import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { useGetMyWatchlist } from '@/features/watchlist/hooks/useGetMyWatchlist.ts';
import { WatchlistItem } from './WatchlistItem';

export function WatchlistDropdown() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetMyWatchlist();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const watchlists = data?.pages.flatMap((page) => page.data.watchlists) ?? [];

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry &&
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4">
            <Skeleton className="size-12 shrink-0 rounded-md" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />

              <div className="flex gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>

            <Skeleton className="size-8 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (watchlists.length === 0) {
    return (
      <div className="text-muted-foreground py-10 text-center">
        Your watchlist is empty.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {watchlists.map((watchlist) => (
        <WatchlistItem key={watchlist.watchlistId} watchlist={watchlist} />
      ))}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex min-h-10 items-center justify-center"
        >
          {isFetchingNextPage && (
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          )}
        </div>
      )}
    </div>
  );
}
