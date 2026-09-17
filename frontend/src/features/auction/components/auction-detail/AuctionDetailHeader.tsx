import { Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { GetAuctionByIdData } from '@/features/auction/types/get-auction-by-id.response';

type AuctionDetailHeaderProps = {
  auction: GetAuctionByIdData;
  isEditing: boolean;
  canEdit: boolean;
  onEdit: () => void;
};

export function AuctionDetailHeader({
  auction,
  isEditing,
  canEdit,
  onEdit,
}: AuctionDetailHeaderProps) {
  const createdAt = new Date(auction.createdAt).toLocaleString();
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
            : `Created ${createdAt}`}
        </p>
      </div>

      {!isEditing && canEdit && (
        <Button type="button" onClick={onEdit}>
          <Pencil />
          Edit
        </Button>
      )}
    </div>
  );
}
