import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar.tsx';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import type { AuctionWinnerEvent } from '@/features/auction/socket/event/auction-winner.event.ts';

type AuctionWinnerDialogProps = {
  winner: AuctionWinnerEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuctionWinnerDialog({
  winner,
  open,
  onOpenChange,
}: AuctionWinnerDialogProps) {
  if (!winner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auction Winner</DialogTitle>
          <DialogDescription>This auction has ended.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={winner.profileImageUrl ?? defaultAvatarImageUrl}
              alt={winner.username}
            />
            <AvatarFallback>
              {winner.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <p className="font-semibold">{winner.username}</p>
            <p className="text-xl font-bold">
              {winner.bidAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
