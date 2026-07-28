import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

type MyProductsPaginationProps = {
  page: number;
  loadedPageCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  limit: number;
  onLimitChange: (limit: number) => void;
};

export function MyProductsPagination({
  page,
  loadedPageCount,
  hasNextPage,
  isFetchingNextPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
  limit,
  onLimitChange,
}: MyProductsPaginationProps) {
  const displayPageCount = hasNextPage ? loadedPageCount + 1 : loadedPageCount;

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-muted-foreground text-sm">Page {page}</div>
      <Select
        value={String(limit)}
        onValueChange={(value) => {
          onLimitChange(Number(value));
        }}
      >
        <SelectTrigger className="w-22.5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
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
              size="sm"
              disabled={isNextPage && isFetchingNextPage}
              onClick={() => {
                if (isNextPage) {
                  onNextPage();
                  return;
                }

                onPageChange(pageNumber);
              }}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={onNextPage}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
