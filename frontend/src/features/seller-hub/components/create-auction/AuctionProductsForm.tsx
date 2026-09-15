import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupInput } from '@/shared/ui/input-group';
import { useFieldArray, type Control, type FieldErrors } from 'react-hook-form';
import { Package, Plus, Trash2 } from 'lucide-react';
import type { CreateAuctionBody } from '@/features/auction/schemas/create-auction.schema';

type ProductOption = {
  productId: string;
  name: string;
  thumbnailUrl: string | null;
  stockQuantity: number;
};

type AuctionProductsFormProps = {
  control: Control<CreateAuctionBody>;
  errors: FieldErrors<CreateAuctionBody>;
  products: ProductOption[];
  onOpenSelectProductsDialog: () => void;
};

export function AuctionProductsForm({
  control,
  errors,
  products,
  onOpenSelectProductsDialog,
}: AuctionProductsFormProps) {
  const { fields, remove, update } = useFieldArray({
    control,
    name: 'auctionProducts',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Auction Products</CardTitle>
        <CardDescription>
          Select the products and quantities you want to include in this
          auction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel className="text-sm font-semibold tracking-wide">
                Products
              </FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenSelectProductsDialog}
              >
                <Plus className="mr-2 size-4" />
                Add Products
              </Button>
            </div>
            <FieldDescription className="text-muted-foreground text-xs">
              Select products from your available inventory.
            </FieldDescription>
            {fields.length === 0 ? (
              <div className="text-muted-foreground flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed">
                <Package className="mb-2 size-8" />
                <p className="text-sm">No products selected</p>
                <p className="text-xs">
                  Click &quot;Add Products&quot; to select products.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const product = products.find(
                    (product) => product.productId === field.productId,
                  );

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
                        <p className="text-muted-foreground truncate text-xs">
                          Stock: {product?.stockQuantity ?? 0}
                        </p>
                      </div>
                      <div className="w-28">
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            min={1}
                            max={product?.stockQuantity}
                            step={1}
                            value={field.quantity}
                            onChange={(event) => {
                              const quantity = Number(event.target.value);
                              update(index, {
                                productId: field.productId,
                                quantity,
                              });
                            }}
                          />
                        </InputGroup>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.auctionProducts && (
              <FieldError className="text-xs leading-tight">
                {errors.auctionProducts.message}
              </FieldError>
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
