import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Field,
  FieldError,
  FieldLabel,
} from '@/shared/ui/field';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProductCategorySchema,
  type CreateProductCategoryBody,
} from '@/features/seller-hub/schemas/product-category/create-product-category.schema';
import { useCreateProductCategory } from '@/features/seller-hub/hooks/product-category/useCreateProductCategory';
import { Loader2 } from 'lucide-react';

type CreateProductCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProductCategoryDialog({
  open,
  onOpenChange,
}: CreateProductCategoryDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateProductCategoryBody>({
    resolver: zodResolver(createProductCategorySchema),
    defaultValues: {
      name: '',
      color: '#000000',
    },
  });

  const createCategoryMutation = useCreateProductCategory(() => {
    onOpenChange(false);
  });

  const color = watch('color');
  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset();
    }
    onOpenChange(value);
  };

  const onSubmit = (data: CreateProductCategoryBody) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input placeholder="Category name" {...register('name')} />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Color</FieldLabel>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  className="h-10 w-16 p-1"
                  {...register('color')}
                />
                <div
                  className="h-7 w-7 rounded-full border"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <span className="text-muted-foreground text-sm">{color}</span>
              </div>
              {errors.color && <FieldError>{errors.color.message}</FieldError>}
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
