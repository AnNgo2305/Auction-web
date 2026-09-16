import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/ui/table.tsx';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Input } from '@/shared/ui/input';
import { MyAuctionsTableRow } from '@/features/seller-hub/components/my-auctions/MyAuctionsDataTableRow';
import type { AuctionData } from '@/features/auction/types/get-my-auctions.response.ts';
import { auctionPaths } from '@/features/auction/constants/auction.routes';
import type { CancelAuctionBody } from '@/features/auction/schemas/cancel-auction.schema.ts';

const ACTION_CONTENT: Record<
  AuctionAction,
  { title: string; description: string; confirmText: string }
> = {
  cancel: {
    title: 'Cancel auction?',
    description:
      'This action will cancel the auction. You may resubmit it later.',
    confirmText: 'Cancel Auction',
  },
  resubmit: {
    title: 'Resubmit auction?',
    description:
      'The auction will be resubmitted and can become available for bidding again.',
    confirmText: 'Resubmit',
  },
  end: {
    title: 'End auction?',
    description:
      'This action will end the auction and no further bids will be accepted.',
    confirmText: 'End Auction',
  },
  confirm: {
    title: 'Confirm auction?',
    description: 'Confirming the auction will complete the auction process.',
    confirmText: 'Confirm',
  },
};

type AuctionAction = 'cancel' | 'resubmit' | 'end' | 'confirm';

type PendingAction = {
  auctionId: string;
  action: AuctionAction;
};

type MyAuctionsDataTableProps = {
  visibleAuctions?: AuctionData[];
  isActionLoading: boolean;
  isLoading: boolean;
  onCancel: (auctionId: string, body: CancelAuctionBody) => void;
  onResubmit: (auctionId: string) => void;
  onEnd: (auctionId: string) => void;
  onConfirm: (auctionId: string) => void;
};

export function MyAuctionsDataTable({
  visibleAuctions = [],
  isActionLoading = false,
  isLoading = false,
  onCancel,
  onResubmit,
  onEnd,
  onConfirm,
}: MyAuctionsDataTableProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const [cancelReason, setCancelReason] = useState('');

  const navigate = useNavigate();

  const dialogContent = pendingAction
    ? ACTION_CONTENT[pendingAction.action]
    : null;

  const handleConfirmAction = () => {
    if (!pendingAction) {
      return;
    }

    const { auctionId, action } = pendingAction;

    switch (action) {
      case 'cancel':
        onCancel(auctionId, {
          cancelReason: cancelReason.trim(),
        });
        break;

      case 'resubmit':
        onResubmit(auctionId);
        break;

      case 'end':
        onEnd(auctionId);
        break;

      case 'confirm':
        onConfirm(auctionId);
        break;
    }

    setPendingAction(null);
    setCancelReason('');
  };

  return (
    <>
      <div className="max-h-150 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Starting Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={10}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : visibleAuctions.map((auction) => (
                  <MyAuctionsTableRow
                    key={auction.auctionId}
                    auctionId={auction.auctionId}
                    title={auction.title}
                    startTime={auction.startTime}
                    endTime={auction.endTime}
                    startingPrice={auction.startingPrice}
                    currentPrice={auction.currentPrice}
                    bidCount={auction.bidCount}
                    status={auction.status}
                    thumbnail={auction.thumbnail}
                    createdAt={auction.createdAt}
                    onViewDetail={(auctionId) => {
                      void navigate(auctionPaths.detail(auctionId));
                    }}
                    onCancel={(auctionId) => {
                      setCancelReason('');

                      setPendingAction({
                        auctionId,
                        action: 'cancel',
                      });
                    }}
                    onResubmit={(auctionId) => {
                      setPendingAction({
                        auctionId,
                        action: 'resubmit',
                      });
                    }}
                    onEnd={(auctionId) => {
                      setPendingAction({
                        auctionId,
                        action: 'end',
                      });
                    }}
                    onConfirm={(auctionId) => {
                      setPendingAction({
                        auctionId,
                        action: 'confirm',
                      });
                    }}
                  />
                ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
            setCancelReason('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogContent?.title}</AlertDialogTitle>

            <AlertDialogDescription>
              {dialogContent?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {pendingAction?.action === 'cancel' && (
            <div className="space-y-2">
              <Input
                placeholder="Enter the reason for canceling this auction..."
                value={cancelReason}
                onChange={(event) => {
                  setCancelReason(event.target.value);
                }}
                disabled={isActionLoading}
                maxLength={1000}
              />

              <div className="text-muted-foreground text-right text-xs">
                {cancelReason.length}/1000
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                isActionLoading ||
                (pendingAction?.action === 'cancel' && !cancelReason.trim())
              }
              onClick={(event) => {
                event.preventDefault();

                if (
                  isActionLoading ||
                  (pendingAction?.action === 'cancel' && !cancelReason.trim())
                ) {
                  return;
                }

                handleConfirmAction();
              }}
            >
              {isActionLoading && <Loader2 className="size-4 animate-spin" />}

              {dialogContent?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}