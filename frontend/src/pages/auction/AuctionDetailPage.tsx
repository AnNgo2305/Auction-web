import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button.tsx';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { AuctionDetailForm } from '@/features/auction/components/auction-detail/AuctionDetailForm.tsx';
import { AuctionDetailHeader } from '@/features/auction/components/auction-detail/AuctionDetailHeader.tsx';
import { useGetAuctionById } from '@/features/auction/hooks/useGetAuctionByID.ts';
import { useAuctionSocket } from '@/features/auction/hooks/useAuctionSocket.ts';
import { usePlaceBid } from '@/features/bid/hooks/usePlaceBid.ts';
import { AuctionBidHistory } from '@/features/bid/components/auction-bid/AuctionBidHistory.tsx';
import { AuctionWinnerDialog } from '@/features/auction/components/auction-detail/AuctionWinnerDialog.tsx';
import { AuctionWatcherList } from '@/features/bid/components/auction-bid/AuctionWatcherList.tsx';
import { AuctionBidForm } from '@/features/bid/components/auction-bid/AuctionBidForm.tsx';
import { AUCTION_STATUSES } from '@/shared/types/auction-status.ts';
import type { AuctionWinnerEvent } from '@/features/auction/socket/event/auction-winner.event.ts';
import { Trophy } from 'lucide-react';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar.tsx';

export function AuctionDetailPage() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [winner, setWinner] = useState<AuctionWinnerEvent | null>(null);

  const {
    data: auction,
    isLoading,
    isError,
    refetch,
  } = useGetAuctionById(auctionId ?? '');

  const handleAuctionWinner = useCallback((event: AuctionWinnerEvent) => {
    setWinner(event);
  }, []);

  const { socketRef, bidders } = useAuctionSocket(
    auctionId ?? '',
    handleAuctionWinner,
  );

  const { handlePlaceBid } = usePlaceBid(socketRef, auctionId ?? '');

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

  return (
    <div className="mx-auto mt-6 mb-12 w-full max-w-5xl space-y-6">
      <AuctionDetailHeader
        auction={auction}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
      />

      {auction.winner && (
        <div className="bg-card flex items-center gap-4 rounded-lg border p-4">
          <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
            <Trophy className="text-primary size-5" />
          </div>

          <Avatar className="size-10">
            <AvatarImage
              src={auction.winner.profileImageUrl ?? defaultAvatarImageUrl}
              alt={auction.winner.username}
            />
            <AvatarFallback>
              {auction.winner.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs">Auction Winner</p>
            <p className="font-semibold">{auction.winner.username}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Winning Bid</p>
            <p className="font-bold">
              {auction.winner.bidAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <AuctionDetailForm
            auction={auction}
            isEditing={isEditing}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              void refetch();
            }}
          />

          <AuctionBidHistory auctionId={auction.auctionId} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AuctionWatcherList bidders={bidders} />
          <AuctionBidForm
            auctionId={auction.auctionId}
            currentPrice={auction.currentPrice}
            minimumBidIncrement={auction.minimumBidIncrement}
            disabled={
              auction.status !== AUCTION_STATUSES.OPEN &&
              auction.status !== AUCTION_STATUSES.EXTENDED
            }
            onSubmit={handlePlaceBid}
          />
        </div>
      </div>

      <AuctionWinnerDialog
        winner={winner}
        open={winner !== null}
        onOpenChange={(open) => {
          if (!open) {
            setWinner(null);
          }
        }}
      />
    </div>
  );
}
