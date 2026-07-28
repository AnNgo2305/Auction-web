import { Button } from '@/shared/ui/button.tsx';
import {
  PRODUCT_STATUSES,
  type ProductStatus,
} from '@/shared/types/product.ts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog.tsx';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type MyProductsBulkActionsProps = {
  selectedProducts?: {
    productId: string;
    status: ProductStatus;
  }[];
  isActionLoading: boolean;
  onClearSelection: () => void;
  onDelete: (productIds: string[]) => void;
  onPublish: (productIds: string[]) => void;
  onArchive: (productIds: string[]) => void;
  onRestore: (productIds: string[]) => void;
};

type BulkAction = 'delete' | 'publish' | 'archive' | 'restore';
const ACTION_CONTENT: Record<
  BulkAction,
  { title: string; description: string; confirmText: string }
> = {
  delete: {
    title: 'Delete selected products?',
    description:
      'The selected products will be permanently deleted. This action cannot be undone.',
    confirmText: 'Delete',
  },
  publish: {
    title: 'Publish selected products?',
    description: 'The selected products will become visible to customers.',
    confirmText: 'Publish',
  },
  archive: {
    title: 'Archive selected products?',
    description:
      'The selected products will be removed from the active product list.',
    confirmText: 'Archive',
  },
  restore: {
    title: 'Restore selected products?',
    description: 'The selected products will be restored.',
    confirmText: 'Restore',
  },
};

export function MyProductsBulkActions({
  selectedProducts = [],
  onClearSelection,
  isActionLoading = false,
  onDelete,
  onPublish,
  onArchive,
  onRestore,
}: MyProductsBulkActionsProps) {
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);

  if (selectedProducts.length === 0) {
    return null;
  }

  const selectedProductIds = selectedProducts.map(
    (product) => product.productId,
  );

  const areAllRemoved = selectedProducts.every(
    (product) => product.status === PRODUCT_STATUSES.REMOVED,
  );

  const areAllDraft = selectedProducts.every(
    (product) => product.status === PRODUCT_STATUSES.DRAFT,
  );

  const areAllReady = selectedProducts.every(
    (product) => product.status === PRODUCT_STATUSES.READY,
  );

  const handleConfirm = () => {
    if (!pendingAction || isActionLoading) {
      return;
    }
    switch (pendingAction) {
      case 'delete':
        onDelete(selectedProductIds);
        break;
      case 'publish':
        onPublish(selectedProductIds);
        break;
      case 'archive':
        onArchive(selectedProductIds);
        break;
      case 'restore':
        onRestore(selectedProductIds);
        break;
    }
  };
  const dialogContent = pendingAction ? ACTION_CONTENT[pendingAction] : null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="text-sm font-semibold text-blue-900">
          {selectedProductIds.length} product {selectedProductIds.length > 1 ? 's' : ''} selected
        </div>
        <div className="flex items-center gap-2">
          {areAllRemoved && (
            <Button
              type="button"
              size="sm"
              disabled={isActionLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setPendingAction('restore')}
            >
              Restore
            </Button>
          )}
          {areAllDraft && (
            <Button
              type="button"
              size="sm"
              disabled={isActionLoading}
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => setPendingAction('publish')}
            >
              Publish
            </Button>
          )}
          {areAllReady && (
            <Button
              type="button"
              size="sm"
              disabled={isActionLoading}
              className="bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => setPendingAction('archive')}
            >
              Archive
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={isActionLoading}
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => setPendingAction('delete')}
          >
            Delete
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isActionLoading}
            onClick={onClearSelection}
          >
            Clear
          </Button>
        </div>
      </div>
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !isActionLoading) {
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogContent?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogContent?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isActionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionLoading}
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
            >
              {isActionLoading && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {dialogContent?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
