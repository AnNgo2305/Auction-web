import { Button } from '@/shared/ui/button.tsx';

type MyProductsBulkActionsProps = {
  selectedProductIds: string[];
  onClearSelection: () => void;
  onDelete?: (productIds: string[]) => void;
  onPublish?: (productIds: string[]) => void;
  onArchive?: (productIds: string[]) => void;
};

export function MyProductsBulkActions({
  selectedProductIds,
  onClearSelection,
  onDelete,
  onPublish,
  onArchive,
}: MyProductsBulkActionsProps) {
  if (selectedProductIds.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <div className="text-sm font-semibold text-blue-900">
        {selectedProductIds.length} product
        {selectedProductIds.length > 1 ? 's' : ''} selected
      </div>

      <div className="flex items-center gap-2">
        {onPublish && (
          <Button
            type="button"
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => onPublish(selectedProductIds)}
          >
            Publish
          </Button>
        )}

        {onArchive && (
          <Button
            type="button"
            size="sm"
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={() => onArchive(selectedProductIds)}
          >
            Archive
          </Button>
        )}

        {onDelete && (
          <Button
            type="button"
            size="sm"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(selectedProductIds)}
          >
            Delete
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
