import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Gavel } from 'lucide-react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createAuctionSchema,
  type CreateAuctionBody,
} from '@/features/auction/schemas/create-auction.schema';
import { AuctionInformationForm } from '@/features/seller-hub/components/create-auction/AuctionInformationForm';
import {
  AuctionProductsForm,
  type ProductOption,
} from '@/features/seller-hub/components/create-auction/AuctionProductsForm';
import { SelectProductsDialog } from '@/features/seller-hub/components/create-auction/SelectProductsDialog';
import { useCreateAuction } from '@/features/auction/hooks/useCreateAuction';
import { Spinner } from '@/shared/ui/spinner';
import { useAuctionStore } from '@/shared/stores/auction.store';

export function CreateAuctionForm() {
  const [openSelectProducts, setOpenSelectProducts] = useState(false);
  const { auction, resetAuction } = useAuctionStore();
  const [products, setProducts] = useState<ProductOption[]>([]);

  const form = useForm<CreateAuctionBody>({
    resolver: zodResolver(createAuctionSchema),
    mode: 'onChange',
    defaultValues: {
      ...auction,
      auctionProducts: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'auctionProducts',
  });

  const auctionProducts = useWatch({
    control,
    name: 'auctionProducts',
  });

  const handleProductsLoaded = (newProducts: ProductOption[]) => {
    setProducts((current) => {
      const productMap = new Map(
        current.map((product) => [product.productId, product]),
      );

      newProducts.forEach((product) => {
        productMap.set(product.productId, product);
      });

      return Array.from(productMap.values());
    });
  };

  const createAuctionMutation = useCreateAuction(() => {
    reset({
      ...auction,
      title: '',
      startTime: '',
      endTime: '',
      startingPrice: undefined,
      minimumBidIncrement: undefined,
      auctionProducts: [],
    });
    resetAuction();
    setOpenSelectProducts(false);
  });

  const onSubmit = (data: CreateAuctionBody) => {
    createAuctionMutation.mutate(data);
  };

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="space-y-2 border-b pb-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border">
          <Gavel className="size-6" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Create Auction
        </CardTitle>
        <CardDescription className="mx-auto max-w-2xl text-sm leading-relaxed">
          Create a new auction by setting its basic information, schedule,
          pricing, and products.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form
          className="space-y-8"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
        >
          <AuctionInformationForm
            register={register}
            control={control}
            errors={errors}
          />
          <AuctionProductsForm
            errors={errors}
            fields={fields}
            remove={remove}
            update={update}
            products={products}
            onOpenSelectProductsDialog={() => setOpenSelectProducts(true)}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || createAuctionMutation.isPending}
            >
              {createAuctionMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Creating...
                </>
              ) : (
                'Create Auction'
              )}
            </Button>
          </div>
        </form>
        <SelectProductsDialog
          open={openSelectProducts}
          onOpenChange={setOpenSelectProducts}
          auctionProducts={auctionProducts}
          append={append}
          onProductsLoaded={handleProductsLoaded}
        />
      </CardContent>
    </Card>
  );
}
