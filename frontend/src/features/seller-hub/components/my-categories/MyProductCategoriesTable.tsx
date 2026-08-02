import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/shared/ui/empty';
import { Tags, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { useEffect, useState } from 'react';
import { useDeleteProductCategory } from '@/features/seller-hub/hooks/product-category/useDeleteProductCategory';
import { useDeleteProductCategories } from '@/features/seller-hub/hooks/product-category/useDeleteProductCategories';

type ProductCategoriesTableProps = {
  categories: {
    categoryId: string;
    name: string;
    color: string;
  }[];
};

export function MyProductCategoriesTable({
  categories,
}: ProductCategoriesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const deleteCategoryMutation = useDeleteProductCategory();
  const deleteCategoriesMutation = useDeleteProductCategories();

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) =>
        categories.some((category) => category.categoryId === id),
      ),
    );
  }, [categories]);

  const isAllSelected =
    categories.length > 0 && selectedIds.length === categories.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(categories.map((category) => category.categoryId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    setSelectedIds((currentIds) => {
      if (checked) {
        return [...currentIds, categoryId];
      }
      return currentIds.filter((id) => id !== categoryId);
    });
  };

  const handleOpenSingleDelete = (categoryId: string) => {
    setDeleteCategoryId(categoryId);
    setOpenDeleteDialog(true);
  };

  const handleOpenMultipleDelete = () => {
    if (!selectedIds.length) {
      return;
    }
    setDeleteCategoryId(null);
    setOpenDeleteDialog(true);
  };

  const handleCancelDelete = () => {
    setDeleteCategoryId(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    if (deleteCategoryId) {
      deleteCategoryMutation.mutate(deleteCategoryId);
    } else {
      deleteCategoriesMutation.mutate({
        categoryIds: selectedIds,
      });
      setSelectedIds([]);
    }

    setDeleteCategoryId(null);
    setOpenDeleteDialog(false);
  };

  if (categories.length === 0) {
    return (
      <Empty className="rounded-md border py-12">
        <EmptyHeader>
          <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <Tags className="text-muted-foreground h-6 w-6" />
          </div>
          <EmptyTitle className="text-lg">No categories found</EmptyTitle>
          <EmptyDescription className="max-w-sm">
            Create product categories to organize your products and make them
            easier to manage.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          <span className="text-muted-foreground text-sm">
            {selectedIds.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleOpenMultipleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-24">Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.categoryId}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(category.categoryId)}
                    onCheckedChange={(checked) =>
                      handleSelectCategory(
                        category.categoryId,
                        Boolean(checked),
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <div
                    className="h-5 w-5 rounded-full"
                    style={{
                      backgroundColor: category.color,
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenSingleDelete(category.categoryId)}
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              {deleteCategoryId
                ? 'this category'
                : `${selectedIds.length} categories`}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
