import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { AuctionDetailInfo } from '@/features/auction/components/auction-detail/AuctionDetailInfo';
import { AuctionDetailProducts } from '@/features/auction/components/auction-detail/AuctionDetailProducts';
import { AuctionDetailSummary } from '@/features/auction/components/auction-detail/AuctionDetailSummary';
import { SelectAuctionProductsDialog } from '@/features/auction/components/auction-detail/SelectAuctionProductsDialog';
import { useUpdateAuction } from '@/features/auction/hooks/useUpdateAuction';
import {
  updateAuctionSchema,
  type UpdateAuctionBody,
} from '@/features/auction/schemas/update-auction.schema';
import type {
  AuctionProductData,
  GetAuctionByIdData,
} from '@/features/auction/types/get-auction-by-id.response';
import { format } from 'date-fns';

type AuctionDetailFormProps = {
  auction: GetAuctionByIdData;
  isEditing: boolean;
  onCancel: () => void;
  onSuccess: () => void;
};

export function AuctionDetailForm({
  auction,
  isEditing,
  onCancel,
  onSuccess,
}: AuctionDetailFormProps) {
  const [isSelectProductsDialogOpen, setIsSelectProductsDialogOpen] =
    useState(false);
  const [products, setProducts] = useState<AuctionProductData[]>(
    auction.auctionProducts,
  );

  const form = useForm<UpdateAuctionBody>({
    resolver: zodResolver(updateAuctionSchema),
    defaultValues: {
      title: auction.title,
      startTime: format(new Date(auction.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(auction.endTime), "yyyy-MM-dd'T'HH:mm"),
      startingPrice: auction.startingPrice,
      minimumBidIncrement: auction.minimumBidIncrement,
      auctionProducts: auction.auctionProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
    },
  });

  const { handleSubmit } = form;
  const { mutate: updateAuction, isPending } = useUpdateAuction(
    auction.auctionId,
    onSuccess,
  );

  const onSubmit = (data: UpdateAuctionBody) => {
    updateAuction(data);
  };

  const handleProductsLoaded = (loadedProducts: AuctionProductData[]) => {
    setProducts((current) => {
      const productMap = new Map(
        current.map((product) => [product.productId, product]),
      );

      for (const product of loadedProducts) {
        productMap.set(product.productId, product);
      }
      return Array.from(productMap.values());
    });
  };

  const handleCancel = () => {
    form.reset({
      title: auction.title,
      startTime: auction.startTime,
      endTime: auction.endTime,
      startingPrice: auction.startingPrice,
      minimumBidIncrement: auction.minimumBidIncrement,
      auctionProducts: auction.auctionProducts.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
    });

    setProducts(auction.auctionProducts);
    onCancel();
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AuctionDetailInfo isEditing={isEditing} />
          </div>

          <AuctionDetailSummary auction={auction} />
        </div>

        <AuctionDetailProducts
          products={products}
          isEditing={isEditing}
          onOpenSelectProductsDialog={() => setIsSelectProductsDialogOpen(true)}
        />

        {isEditing && (
          <div className="flex justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        <SelectAuctionProductsDialog
          open={isSelectProductsDialogOpen}
          onOpenChange={setIsSelectProductsDialogOpen}
          control={form.control}
          onProductsLoaded={handleProductsLoaded}
        />
      </form>
    </FormProvider>
  );
}
