import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import type { MyBidData } from '@/features/bid/types/get-my-bids.response';
import { auctionPaths } from '@/features/auction/constants/auction.routes.ts';

type MyBidItemProps = {
  bid: MyBidData;
};

export function MyBidItem({ bid }: MyBidItemProps) {
  const navigate = useNavigate();

  const handleViewAuction = () => {
    void navigate(auctionPaths.detail(bid.auctionId));
  };

  return (
    <div className="flex items-center gap-4 border-b p-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{bid.auctionTitle}</p>

        <p className="text-muted-foreground text-sm">
          Your bid: {bid.bidAmount.toLocaleString()}
        </p>

        <p className="text-muted-foreground text-xs">
          {new Date(bid.createdAt).toLocaleString()}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleViewAuction}
      >
        View
      </Button>
    </div>
  );
}
