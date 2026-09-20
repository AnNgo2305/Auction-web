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
import type { UseFieldArrayAppend } from 'react-hook-form';
import type { UpdateAuctionBody } from '@/features/auction/schemas/update-auction.schema';
import { useGetMyProducts } from '@/features/seller-hub/hooks/product/useGetMyProducts';
import {
  PRODUCT_STATUSES,
  ProductSortBy,
  SortOrder,
} from '@/shared/types/product';
import type { AuctionProductData } from '@/features/auction/types/get-auction-by-id.response.ts';

type SelectedProduct = {
  productId: string;
  quantity: number;
};

type SelectAuctionProductsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionProducts: UpdateAuctionBody['auctionProducts'];
  append: UseFieldArrayAppend<UpdateAuctionBody, 'auctionProducts'>;
  onProductsLoaded: (products: AuctionProductData[]) => void;
};

export function SelectAuctionProductsDialog({
  open,
  onOpenChange,
  auctionProducts,
  append,
  onProductsLoaded,
}: SelectAuctionProductsDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetMyProducts(
      {
        sortBy: ProductSortBy.CREATED_AT,
        sortOrder: SortOrder.DESC,
        status: PRODUCT_STATUSES.READY,
        limit: 10,
      },
      {
        enabled: open,
      },
    );

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((page) => page.data.data) ?? [];

  const addedProductIds = new Set(
    auctionProducts?.map((product) => product.productId),
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
      return [...current, { productId, quantity: 1 }];
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts((current) =>
      current.map((product) =>
        product.productId === productId ? { ...product, quantity } : product,
      ),
    );
  };

  const handleAddProducts = () => {
    if (selectedProducts.length === 0) {
      return;
    }

    append(selectedProducts);
    const loadedProducts: AuctionProductData[] = products
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
          quantity: selectedProduct.quantity,
          thumbnailUrl: product.thumbnail,
          stockQuantity: product.stockQuantity,
        };
      })
      .filter((product): product is AuctionProductData => product !== null);

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
            Select products to add to this auction.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-125 space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-muted-foreground flex min-h-32 items-center justify-center">
              <Spinner />
            </div>
          ) : products.length === 0 ? (
            <div className="text-muted-foreground flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed">
              <Package className="mb-2 size-8" />
              <p className="text-sm"> No products available </p>
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
                                handleQuantityChange(
                                  product.productId,
                                  Number(event.target.value),
                                );
                              }}
                            />
                          </InputGroup>
                        </div>
                      )}{' '}
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
