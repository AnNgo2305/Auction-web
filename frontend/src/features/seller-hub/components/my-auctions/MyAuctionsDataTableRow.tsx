import type { AuctionStatus } from '@/shared/types/auction-status';
import { MyAuctionsTableActions } from '@/features/seller-hub/components/my-auctions/MyAuctionsTableActions';
import { TableCell, TableRow } from '@/shared/ui/table.tsx';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import { Button } from '@/shared/ui/button.tsx';
import { AspectRatio } from '@/shared/ui/aspect-ratio.tsx';
import { ExternalLink } from 'lucide-react';
import defaultProductImage from '@/assets/images/default-product-image.png';

type MyAuctionsTableRowProps = {
  auctionId: string;
  title: string;
  startTime: string;
  endTime: string;
  startingPrice: number;
  currentPrice: number;
  bidCount: number;
  status: AuctionStatus;
  thumbnail: string | null;
  createdAt: string;

  onViewDetail?: (auctionId: string) => void;
  onCancel?: (auctionId: string) => void;
  onResubmit?: (auctionId: string) => void;
  onEnd?: (auctionId: string) => void;
  onConfirm?: (auctionId: string) => void;
};

export function MyAuctionsTableRow({
  auctionId,
  title,
  startTime,
  endTime,
  startingPrice,
  currentPrice,
  bidCount,
  status,
  thumbnail,
  createdAt,
  onViewDetail,
  onCancel,
  onResubmit,
  onEnd,
  onConfirm,
}: MyAuctionsTableRowProps) {
  const handleViewDetail = () => {
    onViewDetail?.(auctionId);
  };

  return (
    <TableRow>
      <TableCell>
        <AspectRatio
          ratio={1}
          className="flex items-center justify-center overflow-hidden rounded-md bg-transparent"
        >
          <img
            src={thumbnail ?? defaultProductImage}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </AspectRatio>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <p className="max-w-40 truncate font-medium">{title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={handleViewDetail}
          >
            <ExternalLink className="size-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>{formatIsoToDate(startTime)}</TableCell>
      <TableCell>{formatIsoToDate(endTime)}</TableCell>
      <TableCell>{startingPrice.toLocaleString()}</TableCell>
      <TableCell>{currentPrice.toLocaleString()}</TableCell>
      <TableCell>{bidCount}</TableCell>
      <TableCell>{formatIsoToDate(createdAt)}</TableCell>
      <TableCell>{status}</TableCell>
      <TableCell>
        <MyAuctionsTableActions
          auctionId={auctionId}
          status={status}
          onCancel={onCancel}
          onResubmit={onResubmit}
          onEnd={onEnd}
          onConfirm={onConfirm}
        />
      </TableCell>
    </TableRow>
  );
}
