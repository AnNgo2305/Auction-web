import { Badge } from '@/shared/ui/badge.tsx';
import { Button } from '@/shared/ui/button.tsx';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import { productStatusOptions } from '@/features/seller-hub/constants/product-filter-options.ts';
import type { ProductStatus, PublicCategory } from '@/shared/types/product.ts';
import type { DateRange } from 'react-day-picker';
import { X } from 'lucide-react';

type Category = {
  categoryId: string;
  name: string;
};

type MyProductsAppliedFilterTagsProps = {
  keyword?: string;
  status?: ProductStatus;
  publicCategory?: PublicCategory;
  dateRange?: DateRange;
  selectedCategoryIds: string[];
  categories: Category[];
  onClearFilters: () => void;
};

export function MyProductsAppliedFilterTags({
  keyword,
  status,
  publicCategory,
  dateRange,
  selectedCategoryIds,
  categories,
  onClearFilters,
}: MyProductsAppliedFilterTagsProps) {
  const selectedCategories = categories.filter((category) =>
    selectedCategoryIds.includes(category.categoryId),
  );

  const hasFilters =
    keyword ||
    status ||
    publicCategory ||
    dateRange?.from ||
    selectedCategoryIds.length > 0;

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
            {productStatusOptions.find((item) => item.value === status)?.label}
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
        {dateRange?.from && (
          <Badge variant="secondary">
            Created: {formatIsoToDate(dateRange.from.toISOString())}
            {dateRange.to &&
              ` - ${formatIsoToDate(dateRange.to.toISOString())}`}
          </Badge>
        )}
        {selectedCategories.length > 0 && (
          <Badge variant="secondary">
            Categories: {selectedCategories.length}
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
