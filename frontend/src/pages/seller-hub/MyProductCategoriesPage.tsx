import { useGetMyProductCategories } from '@/features/seller-hub/hooks/product-category/useGetMyproductCategory.ts';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { MyProductCategoriesTable } from '@/features/seller-hub/components/my-categories/MyProductCategoriesTable';
import {
  CreateProductCategoryDialog
} from '@/features/seller-hub/components/my-categories/CreateProductCategoryDialog';

export function MyProductCategoriesPage() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { data: categories = [], isLoading } = useGetMyProductCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Categories</h1>
          <p className="text-muted-foreground text-sm">
            Manage categories used to organize your products.
          </p>
        </div>
        <Button onClick={() => setOpenCreateDialog(true)}>
          Create Category
        </Button>
      </div>
      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead className="w-24">Color</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-20 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <MyProductCategoriesTable
          categories={categories}
        />
      )}
      <CreateProductCategoryDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
      />
    </div>
  );
}