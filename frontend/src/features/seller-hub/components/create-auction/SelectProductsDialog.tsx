import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Spinner } from '@/shared/ui/spinner';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupInput } from '@/shared/ui/input-group';
import { Package } from 'lucide-react';
import {
  type UseFieldArrayAppend,
} from 'react-hook-form';
import type { CreateAuctionBody } from '@/features/auction/schemas/create-auction.schema';
import { useGetMyProducts } from '@/features/seller-hub/hooks/product/useGetMyProducts';
import {
  ProductSortBy,
  SortOrder,
  PRODUCT_STATUSES,
} from '@/shared/types/product';
import type { ProductOption } from '@/features/seller-hub/components/create-auction/AuctionProductsForm';

type SelectedProduct = {
  productId: string;
  quantity: number;
};

type SelectProductsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionProducts: CreateAuctionBody['auctionProducts'];
  append: UseFieldArrayAppend<CreateAuctionBody, 'auctionProducts'>;
  onProductsLoaded: (products: ProductOption[]) => void;
};

export function SelectProductsDialog({
  open,
  onOpenChange,
  auctionProducts,
  append,
  onProductsLoaded,
}: SelectProductsDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetMyProducts(
      {
        sortBy: ProductSortBy.CREATED_AT,
        status: PRODUCT_STATUSES.READY,
        sortOrder: SortOrder.DESC,
        limit: 10,
      },
      {
        enabled: open,
      },
    );

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry &&
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((page) => page.data.data) ?? [];

  const addedProductIds = new Set(
    auctionProducts.map((product) => product.productId),
  );

  const selectedProductIds = new Set(
    selectedProducts.map((product) => product.productId),
  );

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((current) => {
      const isSelected = current.some(
        (product) => product.productId === productId,
      );

      if (isSelected) {
        return current.filter((product) => product.productId !== productId);
      }

      return [
        ...current,
        {
          productId,
          quantity: 1,
        },
      ];
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts((current) =>
      current.map((product) =>
        product.productId === productId
          ? {
              ...product,
              quantity,
            }
          : product,
      ),
    );
  };

  const handleAddProducts = () => {
    if (selectedProducts.length === 0) {
      return;
    }

    append(selectedProducts);

    const loadedProducts: ProductOption[] = products
      .map((product) => {
        const selectedProduct = selectedProducts.find(
          (selected) => selected.productId === product.productId,
        );

        if (!selectedProduct) {
          return null;
        }

        return {
          productId: product.productId,
          name: product.name,
          thumbnailUrl: product.thumbnail,
          stockQuantity: product.stockQuantity,
        };
      })
      .filter((product): product is ProductOption => product !== null);

    onProductsLoaded(loadedProducts);

    setSelectedProducts([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedProducts([]);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setSelectedProducts([]);
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            Select the products and quantities you want to include in this
            auction.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-125 space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-muted-foreground flex min-h-32 items-center justify-center text-sm">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <div className="text-muted-foreground flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed">
              <Package className="mb-2 size-8" />
              <p className="text-sm">No products available</p>
            </div>
          ) : (
            products.map((product) => {
              const isAlreadyAdded = addedProductIds.has(product.productId);
              const selectedProduct = selectedProducts.find(
                (selected) => selected.productId === product.productId,
              );

              const isSelected = selectedProductIds.has(product.productId);
              return (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package className="text-muted-foreground size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Stock: {product.stockQuantity}
                    </p>
                  </div>
                  {isAlreadyAdded ? (
                    <span className="text-muted-foreground text-sm">
                      Already added
                    </span>
                  ) : (
                    <>
                      {isSelected && selectedProduct && (
                        <div className="w-24">
                          <InputGroup>
                            <InputGroupInput
                              type="number"
                              min={1}
                              max={product.stockQuantity}
                              step={1}
                              value={selectedProduct.quantity}
                              onChange={(event) => {
                                const quantity = Number(event.target.value);

                                handleQuantityChange(
                                  product.productId,
                                  quantity,
                                );
                              }}
                            />
                          </InputGroup>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleProduct(product.productId)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
        {hasNextPage && (
          <div
            ref={loadMoreRef}
            className="flex min-h-10 items-center justify-center"
          >
            {isFetchingNextPage && <Spinner />}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selectedProducts.length === 0}
            onClick={handleAddProducts}
          >
            Add Products
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
