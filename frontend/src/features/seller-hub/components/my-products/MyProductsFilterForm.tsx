import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group.tsx';
import {
  ArrowDownUp,
  ArrowUpDown,
  CalendarDays,
  CircleCheck,
  FolderTree,
  Search,
  Tags,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/shared/ui/select.tsx';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover.tsx';
import { Checkbox } from '@/shared/ui/checkbox.tsx';
import { Spinner } from '@/shared/ui/spinner.tsx';
import { Button } from '@/shared/ui/button.tsx';
import {
  type ProductStatus,
  type ProductSortBy,
  type PublicCategory,
  PUBLIC_CATEGORIES,
  type SortOrder,
} from '@/shared/types/product.ts';
import { formatIsoToDate } from '@/shared/utils/format-time.ts';
import { Calendar } from '@/shared/ui/calendar.tsx';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/shared/ui/command.tsx';
import {
  productStatusOptions,
  productSortFieldOptions,
  productSortOrderOptions,
} from '@/features/seller-hub/constants/product-filter-options.ts';
import { useGetMyProductCategories } from '@/features/seller-hub/hooks/product-category/useGetMyproductCategory.ts';
import type { DateRange } from 'react-day-picker';
import { useState } from 'react';

type MyProductsFilterValues = {
  keyword: string;
  status?: ProductStatus;
  publicCategory?: PublicCategory;
  dateRange?: DateRange;
  selectedCategoryIds: string[];
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
};

type MyProductsFilterProps = {
  filters: MyProductsFilterValues;
  onFilterChange: <K extends keyof MyProductsFilterValues>(
    key: K,
    value: MyProductsFilterValues[K],
  ) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
};

export function MyProductsFilterForm({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}: MyProductsFilterProps) {
  const [openCategory, setOpenCategory] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } =
    useGetMyProductCategories(openCategory);

  const handleOpenCategoryChange = (open: boolean) => {
    setOpenCategory(open);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      <InputGroup className="bg-background h-11 w-full max-w-10/12 rounded-lg border shadow-sm">
        <InputGroupAddon>
          <Search className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={filters.keyword}
          onChange={(e) => onFilterChange('keyword', e.target.value)}
          placeholder="Search products by name..."
          className="placeholder:text-muted-foreground text-sm"
        />
      </InputGroup>
      <div className="bg-muted/20 flex flex-wrap items-center gap-3 rounded-lg">
        <Select
          key="status-select"
          value={filters.status ?? ''}
          onValueChange={(value) =>
            onFilterChange('status', value as ProductStatus)
          }
        >
          <SelectTrigger className="bg-background h-10 w-40">
            <CircleCheck className="text-muted-foreground size-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {productStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          key="public-category-select"
          value={filters.publicCategory ?? ''}
          onValueChange={(value) =>
            onFilterChange('publicCategory', value as PublicCategory)
          }
        >
          <SelectTrigger className="bg-background h-10 w-56 text-black">
            <Tags className="text-muted-foreground size-4" />
            <SelectValue placeholder="Public Category" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
            className="max-h-60"
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-background h-10 w-72 justify-start text-left font-normal"
            >
              <CalendarDays className="mr-2 size-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {formatIsoToDate(filters.dateRange.from.toISOString())}
                    {' - '}
                    {formatIsoToDate(filters.dateRange.to.toISOString())}
                  </>
                ) : (
                  formatIsoToDate(filters.dateRange.from.toISOString())
                )
              ) : (
                'Select date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="px-4 pt-4">
              <h4 className="text-sm font-medium">Select date range</h4>
              <p className="text-muted-foreground text-xs">
                Filter products by created date
              </p>
            </div>
            <Calendar
              mode="range"
              selected={filters.dateRange}
              onSelect={(value) => onFilterChange('dateRange', value)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Popover open={openCategory} onOpenChange={handleOpenCategoryChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-background h-10 w-45 justify-start"
            >
              <FolderTree className="mr-2 size-4 font-light" />
              {filters.selectedCategoryIds.length > 0
                ? `${filters.selectedCategoryIds.length} categories`
                : 'Category'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-65 p-0">
            {loadingCategories ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 p-4 text-sm">
                <Spinner className="size-4" />
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => {
                    const selected = filters.selectedCategoryIds.includes(
                      category.categoryId,
                    );

                    return (
                      <CommandItem key={category.categoryId}>
                        <Checkbox
                          checked={selected}
                          className="mr-2"
                          onCheckedChange={() => {
                            const ids = selected
                              ? filters.selectedCategoryIds.filter(
                                  (id) => id !== category.categoryId,
                                )
                              : [
                                  ...filters.selectedCategoryIds,
                                  category.categoryId,
                                ];

                            onFilterChange('selectedCategoryIds', ids);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {category.name}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            )}
          </PopoverContent>
        </Popover>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onFilterChange('sortBy', value as ProductSortBy)
          }
        >
          <SelectTrigger className="bg-background h-10 w-44">
            <ArrowUpDown className="text-muted-foreground size-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {productSortFieldOptions.map((field) => (
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
          <SelectTrigger className="bg-background h-10 w-44">
            <ArrowDownUp className="text-muted-foreground size-4" />
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {productSortOrderOptions.map((order) => (
              <SelectItem key={order.value} value={order.value}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleClearFilters}>
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
