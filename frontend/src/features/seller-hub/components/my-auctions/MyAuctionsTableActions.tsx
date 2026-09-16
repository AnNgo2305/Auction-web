import { Button } from '@/shared/ui/button.tsx';
import {
  AUCTION_STATUSES,
  type AuctionStatus,
} from '@/shared/types/auction-status.ts';

type MyAuctionsTableActionsProps = {
  auctionId: string;
  status: AuctionStatus;
  onCancel?: (auctionId: string) => void;
  onResubmit?: (auctionId: string) => void;
  onEnd?: (auctionId: string) => void;
  onConfirm?: (auctionId: string) => void;
};

export function MyAuctionsTableActions({
  auctionId,
  status,
  onCancel,
  onResubmit,
  onEnd,
  onConfirm,
}: MyAuctionsTableActionsProps) {
  const canCancel = [AUCTION_STATUSES.PENDING, AUCTION_STATUSES.READY].includes(
    status,
  );

  const canResubmit = status === AUCTION_STATUSES.CANCELED;

  const canEnd = [AUCTION_STATUSES.OPEN, AUCTION_STATUSES.EXTENDED].includes(
    status,
  );

  const canConfirm = status === AUCTION_STATUSES.PENDING;

  const handleCancel = () => {
    onCancel?.(auctionId);
  };

  const handleResubmit = () => {
    onResubmit?.(auctionId);
  };

  const handleEnd = () => {
    onEnd?.(auctionId);
  };

  const handleConfirm = () => {
    onConfirm?.(auctionId);
  };

  return (
    <div className="flex items-center gap-2">
      {canResubmit && (
        <Button variant="outline" size="sm" onClick={handleResubmit}>
          Resubmit
        </Button>
      )}
      {canCancel && (
        <Button variant="outline" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
      )}
      {canEnd && (
        <Button variant="outline" size="sm" onClick={handleEnd}>
          End
        </Button>
      )}
      {canConfirm && (
        <Button variant="outline" size="sm" onClick={handleConfirm}>
          Confirm
        </Button>
      )}
    </div>
  );
}
