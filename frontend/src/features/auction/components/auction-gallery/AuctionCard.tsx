import { Link } from 'react-router-dom';
import { Gavel } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { SearchAuctionsData } from '@/features/auction/types/search-auctions.response';
import { auctionPaths } from '@/features/auction/constants/auction.routes';

type AuctionCardProps = {
  auction: SearchAuctionsData;
};

export function AuctionCard({ auction }: AuctionCardProps) {
  return (
    <Card className="overflow-hidden">
      <Link to={auctionPaths.detail(auction.auctionId)}>
        <div className="bg-muted aspect-video overflow-hidden">
          {auction.thumbnail ? (
            <img
              src={auction.thumbnail}
              alt={auction.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Gavel className="text-muted-foreground size-10" />
            </div>
          )}
        </div>

        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 font-semibold">{auction.title}</h3>

            <Badge variant="outline" className="shrink-0">
              {auction.status}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Current price</p>
            <p className="text-lg font-semibold">
              {auction.currentPrice.toLocaleString()} ₫
            </p>
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>{auction.bidCount} bids</span>

            <span>Ends {new Date(auction.endTime).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
