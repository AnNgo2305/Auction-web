import { Link } from 'react-router-dom';
import { BookmarkX, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/shared/ui/badge.tsx';
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

const statusVariant = {
  PENDING: 'secondary',
  READY: 'outline',
  OPEN: 'default',
  EXTENDED: 'default',
  COMPLETED: 'secondary',
  CLOSED: 'secondary',
  CANCELED: 'destructive',
} as const;

export function WatchlistItem({ watchlist }: WatchlistItemProps) {
  const { mutate: removeFromWatchlist, isPending } = useRemoveFromWatchlist();

  return (
    <Card>
      <CardContent className="flex items-center gap-4 px-4">
        <Link
          to={auctionPaths.detail(watchlist.auctionId)}
          className="min-w-0 flex-1"
        >
          <h3 className="truncate font-semibold">{watchlist.title}</h3>
          <div className="mt-2 space-y-1.5 text-sm">
            <div>
              <Badge variant={statusVariant[watchlist.status] ?? 'outline'}>
                {watchlist.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Current price:{' '}
              <span className="text-foreground font-medium">
                {watchlist.currentPrice.toLocaleString()} ₫
              </span>
            </p>
            <p className="text-muted-foreground">
              Ends:{' '}
              <span className="text-foreground">
                {new Date(watchlist.endTime).toLocaleDateString()}
              </span>
            </p>
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
              onClick={() => removeFromWatchlist(watchlist.auctionId)}
            >
              <BookmarkX />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
