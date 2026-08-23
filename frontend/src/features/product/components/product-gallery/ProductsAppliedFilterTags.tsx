import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button.tsx';
import { Badge } from '@/shared/ui/badge.tsx';
import type {
  PublicCategory,
  PublicProductStatus,
  PublicProductSortBy,
  SortOrder,
} from '@/shared/types/product.ts';
import {
  publicProductStatusOptions,
  publicProductSortFieldOptions,
  publicProductSortOrderOptions,
} from '@/features/product/constants/product-filter-options.ts';

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
    Boolean(keyword) ||
    Boolean(status) ||
    Boolean(publicCategory) ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="bg-muted/20 flex items-start justify-between gap-4 rounded-lg border p-3">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        {keyword && (
          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
            Search: {keyword}
          </Badge>
        )}
        {status && (
          <Badge className="border-green-200 bg-green-50 text-green-700">
            Status:{' '}
            {
              publicProductStatusOptions.find((item) => item.value === status)
                ?.label
            }
          </Badge>
        )}
        {publicCategory && (
          <Badge className="border-violet-200 bg-violet-50 text-violet-700">
            Category:{' '}
            {publicCategory
              .toLowerCase()
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </Badge>
        )}
        {sortBy !== 'createdAt' && (
          <Badge className="border-orange-200 bg-orange-50 text-orange-700">
            Sort:{' '}
            {
              publicProductSortFieldOptions.find(
                (item) => item.value === sortBy,
              )?.label
            }
          </Badge>
        )}
        {sortOrder !== 'desc' && (
          <Badge className="border-slate-200 bg-slate-100 text-slate-700">
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
