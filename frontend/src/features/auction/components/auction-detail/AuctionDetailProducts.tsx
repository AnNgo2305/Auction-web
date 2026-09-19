import { useFormContext, useFieldArray } from 'react-hook-form';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupInput } from '@/shared/ui/input-group';
import type { UpdateAuctionBody } from '@/features/auction/schemas/update-auction.schema';
import type { AuctionProductData } from '@/features/auction/types/get-auction-by-id.response';
type AuctionDetailProductsProps = {
  products: AuctionProductData[];
  isEditing: boolean;
  onOpenSelectProductsDialog: () => void;
};

export function AuctionDetailProducts({
  products,
  isEditing,
  onOpenSelectProductsDialog,
}: AuctionDetailProductsProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<UpdateAuctionBody>();

  const { fields, remove, update } = useFieldArray({
    control,
    name: 'auctionProducts',
  });

  return (
    <div className="rounded-lg border p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Auction Products</h2>
            <p className="text-muted-foreground text-sm">
              Products included in this auction.
            </p>
          </div>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSelectProductsDialog}
            >
              <Plus /> Add Products
            </Button>
          )}
        </div>
      </div>
      {fields.length === 0 ? (
        <div className="text-muted-foreground flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed">
          <Package className="mb-2 size-8" />
          <p className="text-sm">No products selected</p>
          {isEditing && (
            <p className="text-xs">
              Click &quot;Add Products&quot; to select products.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const product = products.find(
              (item) => item.productId === field.productId,
            );
            const quantityError = errors.auctionProducts?.[index]?.quantity;

            return (
              <div
                key={field.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                  {product?.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package className="text-muted-foreground size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product?.name ?? 'Product'}
                  </p>
                </div>
                <div className="w-28">
                  {isEditing ? (
                    <InputGroup>
                      <InputGroupInput
                        type="number"
                        min={1}
                        max={
                          product
                            ? product.stockQuantity + (field.quantity ?? 0)
                            : undefined
                        }
                        step={1}
                        value={field.quantity}
                        onChange={(event) => {
                          const quantity = Number(event.target.value);
                          update(index, {
                            productId: field.productId,
                            quantity,
                          });
                        }}
                        aria-invalid={!!quantityError}
                      />
                    </InputGroup>
                  ) : (
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Quantity</p>
                      <p className="font-medium">{field.quantity}</p>
                    </div>
                  )}
                  {quantityError && (
                    <p className="text-destructive mt-1 text-xs">
                      {quantityError.message}
                    </p>
                  )}
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {errors.auctionProducts?.message && (
        <p className="text-destructive mt-2 text-sm">
          {errors.auctionProducts.message}
        </p>
      )}
    </div>
  );
}
