import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from '@/shared/ui/table.tsx';
import { Checkbox } from '@/shared/ui/checkbox.tsx';
import { MyProductsTableRow } from './MyProductsDataTableRow.tsx';
import type { ProductData } from '@/features/seller-hub/types/product/get-my-products.response.ts';
import { useEffect, useState } from 'react';

type MyProductsTableProps = {
  products: ProductData[];
  selectedProductIds: string[];
  onSelectionProductChange: (ids: string[]) => void;
  onDelete?: (productId: string) => void;
  onPublish?: (productId: string) => void;
  onRestore?: (productId: string) => void;
  onArchive?: (productId: string) => void;
};

export function MyProductsTable({
  products,
  selectedProductIds,
  onSelectionProductChange,
  onDelete,
  onPublish,
  onRestore,
  onArchive,
}: MyProductsTableProps) {
  // Tracks whether selection mode was enabled by clicking "Select All".
  const [isSelectAll, setIsSelectAll] = useState(false);

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
    setIsSelectAll(checked);

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
    setIsSelectAll(false);
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
      onSelectionProductChange(productIds);
      return;
    }

    // Remove selected ids that are no longer visible in the current product list.
    const filteredSelectedIds = selectedProductIds.filter((id) =>
      productIdSet.has(id),
    );

    if (filteredSelectedIds.length !== selectedProductIds.length) {
      onSelectionProductChange(filteredSelectedIds);
    }
  }, [products, isSelectAll]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
          </TableHead>
          <TableHead />
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((product) => (
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
            onDelete={onDelete}
            onPublish={onPublish}
            onRestore={onRestore}
            onArchive={onArchive}
            checked={selectedProductIds.includes(product.productId)}
            onCheckedChange={handleSelectRow}
          />
        ))}
      </TableBody>
    </Table>
  );
}
