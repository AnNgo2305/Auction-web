import { useFormContext } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import type { UpdateAuctionBody } from '@/features/auction/schemas/update-auction.schema';

type AuctionDetailInfoProps = {
  isEditing: boolean;
};

export function AuctionDetailInfo({
  isEditing,
}: AuctionDetailInfoProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<UpdateAuctionBody>();

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Auction Information</h2>
        <p className="text-muted-foreground text-sm">
          Basic information about this auction.
        </p>
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register('title')}
            readOnly={!isEditing}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-destructive text-sm">
              {errors.title.message}
            </p>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register('startTime')}
              readOnly={!isEditing}
              aria-invalid={!!errors.startTime}
            />
            {errors.startTime && (
              <p className="text-destructive text-sm">
                {errors.startTime.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              {...register('endTime')}
              readOnly={!isEditing}
              aria-invalid={!!errors.endTime}
            />
            {errors.endTime && (
              <p className="text-destructive text-sm">
                {errors.endTime.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting Price</Label>
            <Input
              id="startingPrice"
              type="number"
              min={0}
              {...register('startingPrice', {
                valueAsNumber: true,
              })}
              readOnly={!isEditing}
              aria-invalid={!!errors.startingPrice}
            />
            {errors.startingPrice && (
              <p className="text-destructive text-sm">
                {errors.startingPrice.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimumBidIncrement">
              Minimum Bid Increment
            </Label>
            <Input
              id="minimumBidIncrement"
              type="number"
              min={0}
              {...register('minimumBidIncrement', {
                valueAsNumber: true,
              })}
              readOnly={!isEditing}
              aria-invalid={!!errors.minimumBidIncrement}
            />
            {errors.minimumBidIncrement && (
              <p className="text-destructive text-sm">
                {errors.minimumBidIncrement.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
