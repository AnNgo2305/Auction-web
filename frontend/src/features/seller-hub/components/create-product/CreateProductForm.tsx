import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
  FieldError,
} from '@/shared/ui/field';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/shared/ui/input-group';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
} from '@/shared/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover.tsx';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/shared/ui/command.tsx';
import { Badge } from '@/shared/ui/badge';
import { ProductImagesUploader } from '@/features/seller-hub/components/create-product/ProductImageUploader';
import { ProductDocumentsUploader } from '@/features/seller-hub/components/create-product/ProductDocumentUploader';
import { Checkbox } from '@/shared/ui/checkbox.tsx';
import { Spinner } from '@/shared/ui/spinner.tsx';
import { Boxes, LayoutGrid, Package2, Tags } from 'lucide-react';
import { Textarea } from '@/shared/ui/textarea';
import { Controller } from 'react-hook-form';
import {
  PRODUCT_STATUSES,
  PUBLIC_CATEGORIES,
  type PublicCategory,
} from '@/shared/types/product';
import { Button } from '@/shared/ui/button';
import { useEffect, useState } from 'react';
import { useGetMyProductCategories } from '@/features/seller-hub/hooks/product-category/useGetMyproductCategory.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProductSchema,
  type CreateProductBody,
} from '@/features/seller-hub/schemas/product/create-product.schema';
import { useCreateProduct } from '@/features/seller-hub/hooks/product/useCreateProduct';
import { useProductStore } from '@/shared/stores/product.store.ts';

export function CreateProductForm() {
  const [openCategory, setOpenCategory] = useState(false);

  const {
    product,
    updateBasicInformation,
    setCategories,
    updateImages,
    updateDocuments,
    resetProduct,
  } = useProductStore();

  const form = useForm<CreateProductBody>({
    resolver: zodResolver(createProductSchema),
    mode: 'onChange',
    defaultValues: product,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid },
  } = form;

  const createProductMutation = useCreateProduct(() => {
    reset({
      name: '',
      description: '',
      stockQuantity: 0,
      publicCategory: undefined,
      categoryIds: [],
      status: PRODUCT_STATUSES.READY,
      images: [],
      documents: [],
    });

    resetProduct();
  });

  useEffect(() => {
    const formImages = product.images
      .filter((image) => image.status === 'done' && image.imageKey)
      .map((image) => ({
        imageKey: image.imageKey!,
        isPrimary: image.isPrimary ?? false,
      }));

    setValue('images', formImages, {
      shouldValidate: true,
    });
  }, [product.images, setValue]);

  useEffect(() => {
    const formDocuments = product.documents
      .filter((doc) => doc.status === 'done' && doc.documentKey)
      .map((doc) => ({
        documentName: doc.originalName ?? 'document',
        documentKey: doc.documentKey!,
      }));

    setValue('documents', formDocuments, {
      shouldValidate: true,
    });
  }, [product.documents, setValue]);

  const onSubmit = (data: CreateProductBody) => {
    createProductMutation.mutate(data);
  };

  const { data: categories = [], isLoading: loadingCategories } =
    useGetMyProductCategories(openCategory);

  const handleOpenCategoryChange = (open: boolean) => {
    setOpenCategory(open);
  };

  return (
    <Card className="mx-auto w-full max-w-4xl shadow-sm">
      <CardHeader className="space-y-2 border-b pb-6 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Create Product
        </CardTitle>
        <CardDescription className="mx-auto max-w-2xl text-sm leading-relaxed">
          Add a new product by providing its basic information, selecting the
          appropriate category, setting inventory and pricing details, uploading
          product images, and attaching any supporting documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="name"
                className="text-sm font-semibold tracking-wide"
              >
                Product Name
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Package2 className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="name"
                  placeholder="e.g. Apple iPhone 16 Pro Max"
                  className="h-11"
                  {...register('name', {
                    onChange: (e) =>
                      updateBasicInformation({
                        name: e.target.value,
                      }),
                  })}
                />
              </InputGroup>
              <FieldDescription className="text-muted-foreground text-xs">
                Enter the product name displayed to customers.
              </FieldDescription>
              {errors.name && (
                <FieldError className="text-xs leading-tight text-red-500">
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
                placeholder="Describe your product, including its features, specifications, and key benefits..."
                className="min-h-32 resize-y"
                {...register('description', {
                  onChange: (e) =>
                    updateBasicInformation({
                      description: e.target.value,
                    }),
                })}
              />
              <FieldDescription className="text-muted-foreground text-xs">
                Provide a clear and concise description to help customers
                understand the product.
              </FieldDescription>
              {errors.description && (
                <FieldError className="text-xs leading-tight">
                  {errors.description.message}
                </FieldError>
              )}
            </Field>
          </FieldGroup>
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
                  <Boxes className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="stockQuantity"
                  type="number"
                  min={0}
                  placeholder="e.g. 100"
                  className="h-11"
                  {...register('stockQuantity', {
                    setValueAs: (value) => (value === '' ? 0 : Number(value)),
                    onChange: (e) =>
                      updateBasicInformation({
                        stockQuantity:
                          e.target.value === '' ? 0 : Number(e.target.value),
                      }),
                  })}
                />
              </InputGroup>
              <FieldDescription className="text-muted-foreground text-xs">
                Specify the number of items currently available in stock.
              </FieldDescription>
              {errors.stockQuantity && (
                <FieldError className="text-xs leading-tight">
                  {errors.stockQuantity.message}
                </FieldError>
              )}
            </Field>
            <Field className="space-y-2">
              <FieldLabel
                htmlFor="publicCategory"
                className="text-sm font-semibold tracking-wide"
              >
                Category
              </FieldLabel>
              <Controller
                control={control}
                name="publicCategory"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateBasicInformation({
                        publicCategory: value as PublicCategory,
                      });
                    }}
                    key="product-category-select"
                  >
                    <InputGroup>
                      <InputGroupAddon>
                        <LayoutGrid className="h-4 w-4" />
                      </InputGroupAddon>
                      <SelectTrigger className="h-11 w-full border-0 shadow-none focus:ring-0">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </InputGroup>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      sideOffset={4}
                      avoidCollisions={false}
                      className="max-h-60"
                    >
                      {Object.values(PUBLIC_CATEGORIES).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category
                            .replaceAll('_', ' ')
                            .toLowerCase()
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldDescription className="text-muted-foreground text-xs">
                Select the public category that best matches this product.
              </FieldDescription>
              {errors.publicCategory && (
                <FieldError className="text-xs leading-tight">
                  {errors.publicCategory.message}
                </FieldError>
              )}
            </Field>
            <Field className="space-y-2 md:col-span-2">
              <FieldLabel
                htmlFor="categoryIds"
                className="text-sm font-semibold tracking-wide"
              >
                Categories
              </FieldLabel>
              <Controller
                control={control}
                name="categoryIds"
                render={({ field }) => {
                  const selectedCategories = categories.filter((category) =>
                    field.value?.includes(category.categoryId),
                  );
                  return (
                    <Popover
                      open={openCategory}
                      onOpenChange={handleOpenCategoryChange}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-full justify-start"
                        >
                          <Tags className="mr-2 h-4 w-4" />
                          {selectedCategories.length ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedCategories.map((category) => (
                                <Badge
                                  key={category.categoryId}
                                  style={{
                                    backgroundColor: category.color,
                                  }}
                                  className="border-0 text-white"
                                >
                                  {category.name || 'NO NAME'}
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
                        {loadingCategories ? (
                          <div className="flex items-center justify-center p-4">
                            <Spinner className="size-4" />
                          </div>
                        ) : (
                          <Command>
                            <CommandInput placeholder="Search categories..." />
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => {
                                const selected = field.value?.includes(
                                  category.categoryId,
                                );
                                return (
                                  <CommandItem key={category.categoryId}>
                                    <Checkbox
                                      className="mr-2"
                                      checked={selected}
                                      onCheckedChange={() => {
                                        const nextValue = selected
                                          ? field.value?.filter(
                                              (id) =>
                                                id !== category.categoryId,
                                            )
                                          : [
                                              ...(field.value ?? []),
                                              category.categoryId,
                                            ];

                                        field.onChange(nextValue);

                                        setCategories(nextValue ?? []);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    {category.name}
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
            <Field className="md:col-span-2">
              <FieldLabel className="text-sm font-semibold tracking-wide">
                Product Images
              </FieldLabel>
              <ProductImagesUploader
                productImages={product.images}
                onProductImagesChange={updateImages}
              />
              {errors.images && (
                <FieldError>{errors.images.message}</FieldError>
              )}
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel className="text-sm font-semibold tracking-wide">
                Product Documents
              </FieldLabel>
              <ProductDocumentsUploader
                documents={product.documents}
                onProductDocumentsChange={updateDocuments}
              />
              {errors.documents && (
                <FieldError>{errors.documents.message}</FieldError>
              )}
            </Field>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isValid || createProductMutation.isPending}
            >
              {createProductMutation.isPending
                ? 'Creating...'
                : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
