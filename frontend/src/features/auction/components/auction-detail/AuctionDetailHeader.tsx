import { Bookmark, Pencil } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useAddToWatchlist } from '@/features/watchlist/hooks/useAddToWatchlist';
import type { GetAuctionByIdData } from '@/features/auction/types/get-auction-by-id.response';
import { useRemoveFromWatchlist } from '@/features/watchlist/hooks/useRemoveFromWatchlist.ts';
import { useUser } from '@/shared/contexts/UserContext.tsx'

type AuctionDetailHeaderProps = {
  auction: GetAuctionByIdData;
  isEditing: boolean;
  onEdit: () => void;
};

export function AuctionDetailHeader({
  auction,
  isEditing,
  onEdit,
}: AuctionDetailHeaderProps) {
  const { mutate: addToWatchlist, isPending: isAddingToWatchlist } =
    useAddToWatchlist();

  const { mutate: removeFromWatchlist, isPending: isRemovingFromWatchlist } =
    useRemoveFromWatchlist();

  const isWatchlistPending = isAddingToWatchlist || isRemovingFromWatchlist;

  const createdAt = new Date(auction.createdAt).toLocaleString();

  const handleWatchlistToggle = () => {
    if (auction.isInWatchlist) {
      removeFromWatchlist(auction.auctionId);
      return;
    }

    addToWatchlist(auction.auctionId);
  };

  const { currentUser, isAuthenticated } = useUser();

  const isOwner = isAuthenticated
    ? currentUser?.userId === auction.sellerId
    : false;

  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditing ? 'Edit Auction' : auction.title}
          </h1>
          <Badge variant="outline">{auction.status}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {isEditing
            ? 'Modify your auction information'
            : `Created at ${createdAt}`}
        </p>
      </div>
      {!isEditing && (
        <div className="flex items-center gap-2">
          {isAuthenticated && !isOwner && (
            <Button
              type="button"
              variant={auction.isInWatchlist ? 'secondary' : 'outline'}
              disabled={isWatchlistPending}
              onClick={handleWatchlistToggle}
            >
              <Bookmark
                className={auction.isInWatchlist ? 'fill-current' : undefined}
              />
              {isAddingToWatchlist
                ? 'Adding...'
                : isRemovingFromWatchlist
                  ? 'Removing...'
                  : auction.isInWatchlist
                    ? 'In Watchlist'
                    : 'Add to Watchlist'}
            </Button>
          )}
          {isOwner && (
            <Button type="button" onClick={onEdit}>
              <Pencil />
              Edit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
