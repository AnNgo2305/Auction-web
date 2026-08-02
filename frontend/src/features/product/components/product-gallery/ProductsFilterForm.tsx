import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group.tsx';
import { ArrowDownUp, ArrowUpDown, CircleCheck, Search, Tags } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select.tsx';
import { Button } from '@/shared/ui/button.tsx';
import {
  type PublicCategory,
  PUBLIC_CATEGORIES,
  type SortOrder,
  type PublicProductStatus,
  type PublicProductSortBy,
} from '@/shared/types/product.ts';
import {
  publicProductStatusOptions,
  publicProductSortFieldOptions,
  publicProductSortOrderOptions,
} from '@/features/product/constants/product-filter-options.ts';

type ProductsFilterValues = {
  keyword: string;
  status: PublicProductStatus | undefined;
  publicCategory: PublicCategory | undefined;
  sortBy: PublicProductSortBy;
  sortOrder: SortOrder;
};

type ProductsFilterFormProps = {
  filters: ProductsFilterValues;
  onFilterChange: <K extends keyof ProductsFilterValues>(
    key: K,
    value: ProductsFilterValues[K],
  ) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
};

export function ProductsFilterForm({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: ProductsFilterFormProps) {
  return (
    <div className="space-y-4">
      <InputGroup className="bg-background h-11 w-full rounded-lg border shadow-sm">
        <InputGroupAddon>
          <Search className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={filters.keyword}
          placeholder="Search products..."
          className="placeholder:text-muted-foreground text-sm"
          onChange={(e) => onFilterChange('keyword', e.target.value)}
        />
      </InputGroup>
      <div className="bg-muted/20 flex flex-wrap items-center gap-8 rounded-lg">
        <Select
          value={filters.publicCategory ?? ''}
          onValueChange={(value) =>
            onFilterChange('publicCategory', value as PublicCategory)
          }
        >
          <SelectTrigger className="bg-background h-10 w-60">
            <Tags className="text-muted-foreground size-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {Object.values(PUBLIC_CATEGORIES).map((category) => (
              <SelectItem key={category} value={category}>
                {category
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? ''}
          onValueChange={(value) =>
            onFilterChange('status', value as PublicProductStatus)
          }
        >
          <SelectTrigger className="bg-background h-10 w-60">
            <CircleCheck className="text-muted-foreground size-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {publicProductStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onFilterChange('sortBy', value as PublicProductSortBy)
          }
        >
          <SelectTrigger className="bg-background h-10 w-60">
            <ArrowUpDown className="text-muted-foreground size-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {publicProductSortFieldOptions.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.sortOrder}
          onValueChange={(value) =>
            onFilterChange('sortOrder', value as SortOrder)
          }
        >
          <SelectTrigger className="bg-background h-10 w-36">
            <ArrowDownUp className="text-muted-foreground size-4" />
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {publicProductSortOrderOptions.map((order) => (
              <SelectItem key={order.value} value={order.value}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Clear
          </Button>
          <Button type="button" onClick={onApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
