import { Link } from 'react-router-dom';
import { Bookmark, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card.tsx';
import { Button } from '@/shared/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu.tsx';
import type { WatchlistItemResponse } from '@/features/watchlist/types/get-my-watchlist.response.ts';
import { auctionPaths } from '@/features/auction/constants/auction.routes.ts';
import { useRemoveFromWatchlist } from '@/features/watchlist/hooks/useRemoveFromWatchlist.ts';

type WatchlistItemProps = {
  watchlist: WatchlistItemResponse;
};

export function WatchlistItem({ watchlist }: WatchlistItemProps) {
  const { mutate: removeFromWatchlist, isPending } = useRemoveFromWatchlist();

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-md">
          <Bookmark className="text-muted-foreground size-5" />
        </div>

        <Link
          to={auctionPaths.detail(watchlist.auctionId)}
          className="min-w-0 flex-1"
        >
          <h3 className="truncate font-semibold">{watchlist.title}</h3>

          <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
            <span>{watchlist.status}</span>

            <span>{watchlist.currentPrice.toLocaleString()} ₫</span>

            <span>Ends {new Date(watchlist.endTime).toLocaleDateString()}</span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isPending}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onClick={() => removeFromWatchlist(watchlist.watchlistId)}
            >
              Remove from watchlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
