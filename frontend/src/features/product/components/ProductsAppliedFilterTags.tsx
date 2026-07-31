import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type {
  PublicCategory,
  PublicProductStatus,
  PublicProductSortBy,
  SortOrder,
} from '@/shared/types/product';
import {
  publicProductStatusOptions,
  publicProductSortFieldOptions,
  publicProductSortOrderOptions,
} from '@/features/product/constants/product-filter-options';

type ProductsAppliedFilterTagsProps = {
  keyword?: string;
  status?: PublicProductStatus;
  publicCategory?: PublicCategory;
  sortBy: PublicProductSortBy;
  sortOrder: SortOrder;
  onClearFilters: () => void;
};

export function ProductsAppliedFilterTags({
  keyword,
  status,
  publicCategory,
  sortBy,
  sortOrder,
  onClearFilters,
}: ProductsAppliedFilterTagsProps) {
  const hasFilters =
    keyword ||
    status ||
    publicCategory ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="bg-muted/20 flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {keyword && <Badge variant="secondary">Search: {keyword}</Badge>}
        {status && (
          <Badge variant="secondary">
            Status:{' '}
            {
              publicProductStatusOptions.find((item) => item.value === status)
                ?.label
            }
          </Badge>
        )}
        {publicCategory && (
          <Badge variant="secondary">
            Category:{' '}
            {publicCategory
              .toLowerCase()
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </Badge>
        )}
        {sortBy !== 'createdAt' && (
          <Badge variant="secondary">
            Sort:{' '}
            {
              publicProductSortFieldOptions.find(
                (item) => item.value === sortBy,
              )?.label
            }
          </Badge>
        )}
        {sortOrder !== 'desc' && (
          <Badge variant="secondary">
            Order:{' '}
            {
              publicProductSortOrderOptions.find(
                (item) => item.value === sortOrder,
              )?.label
            }
          </Badge>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={onClearFilters}
      >
        <X className="mr-2 size-4" />
        Clear filters
      </Button>
    </div>
  );
}
