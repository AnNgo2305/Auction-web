import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  placeBidSchema,
  type PlaceBidFormValues,
} from '@/features/bid/socket/payload/place-bid.schema.ts';
import { Button } from '@/shared/ui/button.tsx';
import { Input } from '@/shared/ui/input.tsx';
import { Label } from '@/shared/ui/label.tsx';

type AuctionBidFormProps = {
  auctionId: string;
  currentPrice: number | null;
  minimumBidIncrement: number;
  disabled?: boolean;
  onSubmit: (bidAmount: number) => void;
};

export function AuctionBidForm({
  auctionId,
  currentPrice,
  minimumBidIncrement,
  disabled = false,
  onSubmit,
}: AuctionBidFormProps) {
  const minimumBid =
    currentPrice !== null
      ? currentPrice + minimumBidIncrement
      : minimumBidIncrement;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlaceBidFormValues>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      auctionId,
      tempId: crypto.randomUUID(),
      bidAmount: minimumBid,
    },
  });

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit((data) => {
          onSubmit(data.bidAmount);
        })(event);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="bidAmount">Your Bid</Label>

        <Input
          id="bidAmount"
          type="number"
          min={minimumBid}
          {...register('bidAmount', {
            valueAsNumber: true,
          })}
          disabled={disabled || isSubmitting}
          aria-invalid={!!errors.bidAmount}
        />

        {errors.bidAmount && (
          <p className="text-destructive text-sm">{errors.bidAmount.message}</p>
        )}

        <p className="text-muted-foreground text-sm">
          Minimum bid: {minimumBid.toLocaleString()}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
      </Button>
    </form>
  );
}
