import { Controller, type UseFormReturn } from 'react-hook-form';
import type { UpdateProductBody } from '@/features/product/schemas/product/update-product.schema';
import { useNavigate } from 'react-router-dom';
import { Field, FieldLabel, FieldGroup, FieldDescription, FieldError } from '@/shared/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group';
import { Boxes, Calendar, Clock3, LayoutGrid, Package2, Tags, User } from 'lucide-react';
import { Badge } from '@/shared/ui/badge'
import { Textarea } from '@/shared/ui/textarea';
import { Separator } from '@/shared/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select';
import { PUBLIC_CATEGORIES, PUBLIC_PRODUCT_STATUSES } from '@/shared/types/product';
import { Button } from '@/shared/ui/button';
import { formatIsoToDate } from '@/shared/utils/format-time';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover';
import { Command, CommandItem, CommandGroup, CommandInput, CommandEmpty } from '@/shared/ui/command';
import { Checkbox } from '@/shared/ui/checkbox';
import { useState } from 'react';
import { useGetMyProductCategories } from '@/features/seller-hub/hooks/product-category/useGetMyproductCategory';
import { Spinner } from '@/shared/ui/spinner.tsx';
import { useUpdateProduct } from '@/features/product/hooks/product/useUpdateProduct.ts';

type ProductBasicInformationFormProps = {
  productId: string;
  form: UseFormReturn<UpdateProductBody>;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
  onExitEditMode: () => void;
};

export function ProductBasicInformationForm({
  productId,
  form,
  sellerName,
  sellerId,
  createdAt,
  updatedAt,
  onExitEditMode,
}: ProductBasicInformationFormProps) {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(false);
  const { data: availableCategories = [], isLoading: isLoadingCategories } =
    useGetMyProductCategories(openCategory);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = form;

  const updateProductMutation = useUpdateProduct(onExitEditMode);

  const onSubmit = (data: UpdateProductBody) => {
    updateProductMutation.mutate({
      ...data,
      productId: productId,
    });
  };

  return (
    <form
      className="bg-background space-y-8 rounded-xl border p-6 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Field className="space-y-2">
          <FieldLabel
            htmlFor="name"
            className="text-sm font-semibold tracking-wide"
          >
            Product Name
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Package2 className="text-muted-foreground size-4" />
            </InputGroupAddon>
            <InputGroupInput
              id="name"
              placeholder="e.g. MacBook Pro M3"
              className="h-11"
              {...register('name')}
            />
          </InputGroup>
          <FieldDescription className="text-muted-foreground text-xs">
            Enter the product name displayed to customers.
          </FieldDescription>
          {errors.name && (
            <FieldError className="text-xs leading-tight">
              {errors.name.message}
            </FieldError>
          )}
        </Field>
        <Field className="space-y-2">
          <FieldLabel
            htmlFor="description"
            className="text-sm font-semibold tracking-wide"
          >
            Description
          </FieldLabel>
          <Textarea
            id="description"
            rows={5}
            placeholder="Describe this product..."
            className="resize-none"
            {...register('description')}
          />
          <FieldDescription className="text-muted-foreground text-xs">
            A brief description displayed on the product page.
          </FieldDescription>
          {errors.description && (
            <FieldError>{errors.description.message}</FieldError>
          )}
        </Field>
        <Separator className="my-2" />
        <div className="grid gap-6 md:grid-cols-2">
          <Field className="space-y-2">
            <FieldLabel
              htmlFor="stockQuantity"
              className="text-sm font-semibold tracking-wide"
            >
              Stock Quantity
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Boxes className="text-muted-foreground size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="stockQuantity"
                type="number"
                min={0}
                className="h-11"
                {...register('stockQuantity', {
                  valueAsNumber: true,
                })}
              />
            </InputGroup>
            {errors.stockQuantity && (
              <FieldError>{errors.stockQuantity.message}</FieldError>
            )}
          </Field>
          <Field className="space-y-2">
            <FieldLabel className="text-sm font-semibold tracking-wide">
              Public Category
            </FieldLabel>
            <Controller
              control={control}
              name="publicCategory"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <InputGroup>
                    <InputGroupAddon>
                      <LayoutGrid className="text-muted-foreground size-4" />
                    </InputGroupAddon>
                    <SelectTrigger className="h-11 w-full border-0 shadow-none">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </InputGroup>
                  <SelectContent>
                    {Object.values(PUBLIC_CATEGORIES).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category
                          .toLowerCase()
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.publicCategory && (
              <FieldError>{errors.publicCategory.message}</FieldError>
            )}
          </Field>
          <Field className="space-y-2">
            <FieldLabel className="text-sm font-semibold tracking-wide">
              Status
            </FieldLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PUBLIC_PRODUCT_STATUSES).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status
                          .toLowerCase()
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <FieldError>{errors.status.message}</FieldError>}
          </Field>
          <Field className="space-y-2">
            <FieldLabel>Seller</FieldLabel>
            <Button
              type="button"
              variant="link"
              className="h-11 justify-start px-0"
              onClick={() => navigate(`/users/${sellerId}`)}
            >
              <User className="mr-2 size-4" />
              {sellerName}
            </Button>
          </Field>
          <Field className="space-y-2">
            <FieldLabel>Created</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Calendar className="text-muted-foreground size-4" />
              </InputGroupAddon>
              <InputGroupInput readOnly value={formatIsoToDate(createdAt)} />
            </InputGroup>
          </Field>
          <Field className="space-y-2">
            <FieldLabel>Last Updated</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Clock3 className="text-muted-foreground size-4" />
              </InputGroupAddon>
              <InputGroupInput readOnly value={formatIsoToDate(updatedAt)} />
            </InputGroup>
          </Field>
        </div>
        <Field className="space-y-2 md:col-span-2">
          <FieldLabel className="text-sm font-semibold tracking-wide">
            Categories
          </FieldLabel>
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => {
              const selectedCategories = availableCategories.filter(
                (category) => field.value?.includes(category.categoryId),
              );
              return (
                <Popover open={openCategory} onOpenChange={setOpenCategory}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto min-h-11 w-full justify-start"
                    >
                      <Tags className="mr-2 size-4 shrink-0" />
                      {selectedCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedCategories.map((category) => (
                            <Badge
                              key={category.categoryId}
                              variant="secondary"
                            >
                              {category.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select categories
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                  >
                    {isLoadingCategories ? (
                      <div className="flex justify-center p-4">
                        <Spinner className="size-4" />
                      </div>
                    ) : (
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {availableCategories.map((availableCategory) => {
                            const selected = field.value?.includes(
                              availableCategory.categoryId,
                            );
                            return (
                              <CommandItem key={availableCategory.categoryId}>
                                <Checkbox
                                  className="mr-2"
                                  checked={selected}
                                  onCheckedChange={() => {
                                    field.onChange(
                                      selected
                                        ? field.value?.filter(
                                            (id) =>
                                              id !==
                                              availableCategory.categoryId,
                                          )
                                        : [
                                            ...(field.value ?? []),
                                            availableCategory.categoryId,
                                          ],
                                    );
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                {availableCategory.name}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </Command>
                    )}
                  </PopoverContent>
                </Popover>
              );
            }}
          />
          <FieldDescription className="text-xs">
            Select one or more categories for this product.
          </FieldDescription>
          {errors.categoryIds && (
            <FieldError>{errors.categoryIds.message}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={!isDirty || updateProductMutation.isPending}
          onClick={() => {
            reset();
            onExitEditMode();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || !isValid || updateProductMutation.isPending}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
