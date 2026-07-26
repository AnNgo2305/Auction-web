import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group.tsx';
import {
  ArrowDownUp,
  ArrowUpDown,
  CalendarDays,
  CircleCheck,
  FolderTree,
  Search,
  Tags,
} from 'lucide-react';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/shared/ui/select.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover.tsx';
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
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/shared/ui/command.tsx';
import {
  productStatusOptions,
  productSortFieldOptions,
  productSortOrderOptions,
} from '@/features/seller-hub/constants/product-filter-options.ts';
import { useGetMyProductCategories } from '@/features/seller-hub/hooks/product-category/useGetMyproductCategory.ts';
import type { DateRange } from 'react-day-picker';
import { useState } from 'react';

type MyProductsFilterProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;

  dateRange?: DateRange;
  onDateRangeChange: (value: DateRange | undefined) => void;

  publicCategory?: PublicCategory;
  onPublicCategoryChange: (value: PublicCategory) => void;

  status?: ProductStatus;
  onStatusChange: (value: ProductStatus) => void;

  selectedCategoryIds: string[];
  onSelectedCategoryIdsChange: (value: string[]) => void;

  sortBy: ProductSortBy;
  onSortByChange: (value: ProductSortBy) => void;

  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
};

export function MyProductsFilterForm({
  keyword,
  onKeywordChange,

  status,
  onStatusChange,

  dateRange,
  onDateRangeChange,

  selectedCategoryIds,
  onSelectedCategoryIdsChange,

  sortBy,
  onSortByChange,

  sortOrder,
  onSortOrderChange,
}: MyProductsFilterProps) {
  const [openCategory, setOpenCategory] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } =
    useGetMyProductCategories(openCategory);

  const handleOpenCategoryChange = (open: boolean) => {
    setOpenCategory(open);
  };

  return (
    <div className="space-y-4">
      <InputGroup className="bg-background h-11 w-full max-w-xl rounded-lg border shadow-sm">
        <InputGroupAddon>
          <Search className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search products by name..."
          className="placeholder:text-muted-foreground text-sm"
        />
      </InputGroup>
      <div className="bg-muted/20 flex flex-wrap items-center gap-3 rounded-lg border p-3">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="bg-background h-10 w-40">
            <CircleCheck className="text-muted-foreground size-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {productStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="bg-background h-10 w-45">
            <Tags className="text-muted-foreground absolute left-3 size-4" />
            <SelectValue placeholder="Public Category" />
          </SelectTrigger>
          <SelectContent>
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
              className="bg-background h-10 w-45 justify-start text-left font-normal"
            >
              <CalendarDays className="mr-2 size-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {formatIsoToDate(dateRange.from.toISOString())}
                    {' - '}
                    {formatIsoToDate(dateRange.to.toISOString())}
                  </>
                ) : (
                  formatIsoToDate(dateRange.from.toISOString())
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
              selected={dateRange}
              onSelect={onDateRangeChange}
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
              <FolderTree className="mr-2 size-4" />
              {selectedCategoryIds.length > 0
                ? `${selectedCategoryIds.length} categories`
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
                    const selected = selectedCategoryIds.includes(
                      category.categoryId,
                    );

                    return (
                      <CommandItem key={category.categoryId}>
                        <Checkbox
                          checked={selected}
                          className="mr-2"
                          onCheckedChange={() => {
                            const newCategoryIds = selected
                              ? selectedCategoryIds.filter(
                                  (id) => id !== category.categoryId,
                                )
                              : [...selectedCategoryIds, category.categoryId];

                            onSelectedCategoryIdsChange(newCategoryIds);
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
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="bg-background h-10 w-40">
            <ArrowUpDown className="text-muted-foreground size-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {productSortFieldOptions.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="bg-background h-10 w-35">
            <ArrowDownUp className="text-muted-foreground size-4" />
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            {productSortOrderOptions.map((order) => (
              <SelectItem key={order.value} value={order.value}>
                {order.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}