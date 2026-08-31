import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/ui/table.tsx';
import { Checkbox } from '@/shared/ui/checkbox.tsx';
import { MyProductsTableRow } from './MyProductsDataTableRow.tsx';
import type { ProductData } from '@/features/seller-hub/types/product/get-my-products.response.ts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
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
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productPaths } from '@/features/product/constants/product.routes.ts';

const ACTION_CONTENT: Record<
  ProductAction,
  { title: string; description: string; confirmText: string }
> = {
  delete: {
    title: 'Delete product?',
    description:
      'This action cannot be undone. The product will be permanently deleted.',
    confirmText: 'Delete',
  },
  publish: {
    title: 'Publish product?',
    description: 'The product will become visible to customers.',
    confirmText: 'Publish',
  },
  restore: {
    title: 'Restore product?',
    description: 'The product will be restored and become active again.',
    confirmText: 'Restore',
  },
  archive: {
    title: 'Archive product?',
    description: 'The product will be removed from the active product list.',
    confirmText: 'Archive',
  },
};

type ProductAction = 'delete' | 'publish' | 'restore' | 'archive';
type PendingAction = { productId: string; action: ProductAction };

type MyProductsDataTableProps = {
  products?: ProductData[];
  visibleProducts?: ProductData[];
  isActionLoading: boolean;
  isLoading: boolean;
  selectedProductIds: string[];
  onSelectionProductChange: (ids: string[]) => void;
  onDelete: (productId: string) => void;
  onPublish: (productId: string) => void;
  onRestore: (productId: string) => void;
  onArchive: (productId: string) => void;
  isSelectAll: boolean;
  onSelectAllChange: (value: boolean) => void;
};

export function MyProductsDataTable({
  products = [],
  visibleProducts = [],
  isLoading = false,
  isActionLoading = false,
  selectedProductIds,
  onSelectionProductChange,
  onDelete,
  onPublish,
  onRestore,
  onArchive,
  isSelectAll,
  onSelectAllChange,
}: MyProductsDataTableProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  // Tracks whether selection mode was enabled by clicking "Select All".
  const navigate = useNavigate();

  // Checkbox is checked when:
  // - User explicitly clicked "Select All", OR
  // - All currently loaded products are selected manually.
  const allSelected =
    isSelectAll ||
    (products.length > 0 &&
      products.every((product) =>
        selectedProductIds.includes(product.productId),
      ));

  const handleSelectAll = (checked: boolean) => {
    onSelectAllChange(checked);

    // Clear selection when user turns off select all.
    if (!checked) {
      onSelectionProductChange([]);
      return;
    }

    // Actual selection update is handled by useEffect.
    // This allows newly fetched products from infinite query
    // to be included automatically.
  };

  const handleSelectRow = (productId: string, checked: boolean) => {
    if (checked) {
      // Add selected product without creating duplicated ids.
      onSelectionProductChange([
        ...new Set([...selectedProductIds, productId]),
      ]);
      return;
    }

    // Selecting a single row manually disables select-all mode.
    // Remove product from current selection.
    onSelectAllChange(false);
    onSelectionProductChange(
      selectedProductIds.filter((id) => id !== productId),
    );
  };

  useEffect(() => {
    // Keep selected ids in sync with product changes.
    // Supports infinite loading and clearing stale selections.
    const productIds = products.map((product) => product.productId);
    const productIdSet = new Set(productIds);

    // Sync selection when product list changes (e.g. loading next page).
    // When "select all" is active, automatically select newly loaded products.
    if (isSelectAll) {
      const same =
        productIds.length === selectedProductIds.length &&
        productIds.every((id, i) => id === selectedProductIds[i]);

      if (!same) {
        onSelectionProductChange(productIds);
      }

      return;
    }

    // Remove selected ids that are no longer visible in the current product list.
    const filteredSelectedIds = selectedProductIds.filter((id) =>
      productIdSet.has(id),
    );

    if (filteredSelectedIds.length !== selectedProductIds.length) {
      onSelectionProductChange(filteredSelectedIds);
    }
  }, [products, isSelectAll, selectedProductIds, onSelectionProductChange]);

  const dialogContent = pendingAction
    ? ACTION_CONTENT[pendingAction.action]
    : null;

  const handleConfirmAction = () => {
    if (!pendingAction) {
      return;
    }
    const { productId, action } = pendingAction;
    switch (action) {
      case 'delete':
        onDelete(productId);
        break;
      case 'publish':
        onPublish(productId);
        break;
      case 'restore':
        onRestore(productId);
        break;
      case 'archive':
        onArchive(productId);
        break;
    }
    setPendingAction(null);
  };

  return (
    <>
      <div className="max-h-150 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={11}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : visibleProducts.map((product) => (
                  <MyProductsTableRow
                    key={product.productId}
                    productId={product.productId}
                    name={product.name}
                    description={product.description}
                    thumbnail={product.thumbnail}
                    stockQuantity={product.stockQuantity}
                    status={product.status}
                    publicCategory={product.publicCategory}
                    categories={product.categories}
                    createdAt={product.createdAt}
                    updatedAt={product.updatedAt}
                    checked={selectedProductIds.includes(product.productId)}
                    onCheckedChange={handleSelectRow}
                    onViewDetail={() => {
                      void navigate(productPaths.detail(product.productId));
                    }}
                    onDelete={(productId) => {
                      setPendingAction({ productId, action: 'delete' });
                    }}
                    onPublish={(productId) => {
                      setPendingAction({ productId, action: 'publish' });
                    }}
                    onRestore={(productId) => {
                      setPendingAction({ productId, action: 'restore' });
                    }}
                    onArchive={(productId) => {
                      setPendingAction({ productId, action: 'archive' });
                    }}
                  />
                ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle> {dialogContent?.title} </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionLoading}
              onClick={(event) => {
                event.preventDefault();
                if (!isActionLoading) {
                  handleConfirmAction();
                }
              }}
            >
              {isActionLoading && <Loader2 className="size-4 animate-spin" />}
              {dialogContent?.confirmText}
            </AlertDialogAction>{' '}
          </AlertDialogFooter>{' '}
        </AlertDialogContent>{' '}
      </AlertDialog>
    </>
  );
}
