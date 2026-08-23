import type { ProductStatus, PublicCategory } from '@/shared/types/product.ts';
import { MyProductsTableActions } from './MyProductsTableActions.tsx';
import { TableCell, TableRow } from '@/shared/ui/table.tsx';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import { Button } from '@/shared/ui/button.tsx';
import { Checkbox } from '@/shared/ui/checkbox.tsx';
import { AspectRatio } from '@/shared/ui/aspect-ratio.tsx';
import { ExternalLink } from 'lucide-react';
import defaultProductImage from '@/assets/images/default-product-image.png';

type MyProductsTableRowProps = {
  productId: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  stockQuantity: number;
  status: ProductStatus;
  publicCategory: PublicCategory;
  categories: {
    categoryId: string;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
  onViewDetail?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onPublish?: (productId: string) => void;
  onRestore?: (productId: string) => void;
  onArchive?: (productId: string) => void;
  checked: boolean;
  onCheckedChange: (productId: string, checked: boolean) => void;
};

export function MyProductsTableRow({
  productId,
  name,
  description,
  thumbnail,
  stockQuantity,
  status,
  publicCategory,
  categories,
  createdAt,
  updatedAt,
  onViewDetail,
  onDelete,
  onPublish,
  onRestore,
  onArchive,
  checked,
  onCheckedChange,
}: MyProductsTableRowProps) {
  const handleViewDetail = () => {
    onViewDetail?.(productId);
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) =>
            onCheckedChange(productId, Boolean(value))
          }
        />
      </TableCell>
      <TableCell>
        <AspectRatio
          ratio={1}
          className="flex items-center justify-center overflow-hidden rounded-md bg-transparent"
        >
          <img
            src={thumbnail ?? defaultProductImage}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        </AspectRatio>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <p className="max-w-40 truncate font-medium">{name}</p>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={handleViewDetail}
          >
            <ExternalLink className="size-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-muted-foreground max-w-75 truncate text-sm">
          {description || '-'}
        </p>
      </TableCell>
      <TableCell>
        {publicCategory
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())}
      </TableCell>
      <TableCell>
        <div className="flex max-w-xs flex-wrap gap-1">
          {categories.slice(0, 2).map((category) => (
            <span
              key={category.categoryId}
              className="bg-muted rounded-md px-2 text-xs"
            >
              {category.name}
            </span>
          ))}
          {categories.length > 2 && (
            <span className="text-muted-foreground text-xs">
              +{categories.length - 2}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{stockQuantity}</TableCell>
      <TableCell>{formatIsoToDate(createdAt)}</TableCell>
      <TableCell>{formatIsoToDate(updatedAt)}</TableCell>
      <TableCell>{status}</TableCell>
      <TableCell>
        <MyProductsTableActions
          productId={productId}
          status={status}
          onDelete={onDelete}
          onPublish={onPublish}
          onRestore={onRestore}
          onArchive={onArchive}
        />
      </TableCell>
    </TableRow>
  );
}
