import { Badge } from '@/shared/ui/badge';
import type { GetAuctionByIdData } from '@/features/auction/types/get-auction-by-id.response';
import { format } from 'date-fns';

type AuctionDetailSummaryProps = {
  auction: GetAuctionByIdData;
};

export function AuctionDetailSummary({
  auction,
}: AuctionDetailSummaryProps) {
  const createdAt = format(new Date(auction.createdAt), 'dd/MM/yyyy HH:mm');
  const updatedAt = format(new Date(auction.updatedAt), 'dd/MM/yyyy HH:mm');

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Auction Summary</h2>
        <p className="text-muted-foreground text-sm">
          Current auction status and statistics.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-muted-foreground text-sm">Status</p>
          <div className="mt-1">
            <Badge variant="outline">{auction.status}</Badge>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">
            Current Price
          </p>
          <p className="mt-1 text-lg font-semibold">
            {auction.currentPrice.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">
            Bid Count
          </p>
          <p className="mt-1 text-lg font-semibold">
            {auction.bidCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Created At</p>
          <p className="mt-1 text-sm">{createdAt}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Updated At</p>
          <p className="mt-1 text-sm">{updatedAt}</p>
        </div>
      </div>
    </div>
  );
}
