import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select.tsx';

type ProductsPaginationProps = {
  page: number;
  loadedPageCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  limit: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLimitChange: (limit: number) => void;
};

export function ProductsPagination({
  page,
  loadedPageCount,
  hasNextPage,
  isFetchingNextPage,
  limit,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onLimitChange,
}: ProductsPaginationProps) {
  const displayPageCount = hasNextPage ? loadedPageCount + 1 : loadedPageCount;

  return (
    <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground text-sm">
        Page {page} of {displayPageCount}
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={String(limit)}
          onValueChange={(value) => onLimitChange(Number(value))}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>

          <SelectContent
            position="popper"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={onPreviousPage}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {Array.from({ length: displayPageCount }).map((_, index) => {
            const pageNumber = index + 1;
            const isNextPage = pageNumber > loadedPageCount;

            return (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? 'default' : 'outline'}
                size="icon"
                disabled={isNextPage && isFetchingNextPage}
                onClick={() => {
                  if (isNextPage) {
                    onNextPage();
                  } else {
                    onPageChange(pageNumber);
                  }
                }}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            disabled={
              isFetchingNextPage || (!hasNextPage && page >= loadedPageCount)
            }
            onClick={onNextPage}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
