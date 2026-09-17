import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '@/shared/contexts/UserContext.tsx'
import { Button } from '@/shared/ui/button.tsx';
import { AuctionDetailForm } from '@/features/auction/components/auction-detail/AuctionDetailForm.tsx';
import { useGetAuctionById } from '@/features/auction/hooks/useGetAuctionByID.ts';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { Bookmark } from 'lucide-react';
import { useAddToWatchlist } from '@/features/watchlist/hooks/useAddToWatchlist.ts';

export function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useUser();
  const { mutate: addToWatchlist, isPending: isAddingToWatchlist } =
    useAddToWatchlist();

  const { data: auction, isLoading, isError, refetch } = useGetAuctionById(
    auctionId ?? '',
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <Skeleton className="size-12 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-9 w-24" />
                <Skeleton className="size-9" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !auction) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">Failed to load auction.</p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const isOwner = currentUser?.userId === auction.sellerId;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{auction.title}</h1>
          <p className="text-muted-foreground text-sm">
            Auction details and products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isOwner && (
            <Button
              type="button"
              variant="outline"
              disabled={isAddingToWatchlist}
              onClick={() => addToWatchlist(auction.auctionId)}
            >
              <Bookmark className="size-4" />
              {isAddingToWatchlist ? 'Adding...' : 'Add to Watchlist'}
            </Button>
          )}

          {isOwner && !isEditing && (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Auction
            </Button>
          )}
        </div>
      </div>
      <AuctionDetailForm
        auction={auction}
        isEditing={isEditing}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false);
          void refetch();
        }}
      />
    </div>
  );
}
