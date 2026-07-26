import { Button } from '@/shared/ui/button.tsx';
import { PRODUCT_STATUSES, type ProductStatus } from '@/shared/types/product.ts';

type MyProductsTableActionsProps = {
  productId: string;
  status: ProductStatus;
  onDelete?: (productId: string) => void;
  onPublish?: (productId: string) => void;
  onRestore?: (productId: string) => void;
  onArchive?: (productId: string) => void;
};

export function MyProductsTableActions({
  productId,
  status,
  onDelete,
  onPublish,
  onRestore,
  onArchive,
}: MyProductsTableActionsProps) {
  const canPublish = status === PRODUCT_STATUSES.DRAFT;

  const canArchive = status === PRODUCT_STATUSES.READY;

  const canRestore = status === PRODUCT_STATUSES.REMOVED;

  const canDelete = [
    PRODUCT_STATUSES.DRAFT,
    PRODUCT_STATUSES.READY,
    PRODUCT_STATUSES.SOLD,
    PRODUCT_STATUSES.REMOVED,
  ].includes(status);

  const handleDelete = () => {
    onDelete?.(productId);
  };

  const handlePublish = () => {
    onPublish?.(productId);
  };

  const handleRestore = () => {
    onRestore?.(productId);
  };

  const handleArchive = () => {
    onArchive?.(productId);
  };

  return (
    <div className="flex items-center gap-2">
      {canPublish && (
        <Button variant="outline" size="sm" onClick={handlePublish}>
          Publish
        </Button>
      )}

      {canRestore && (
        <Button variant="outline" size="sm" onClick={handleRestore}>
          Restore
        </Button>
      )}

      {canArchive && (
        <Button variant="outline" size="sm" onClick={handleArchive}>
          Archive
        </Button>
      )}

      {canDelete && (
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}
