import { Button } from '@/shared/ui/button.tsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type MyProductsPaginationProps = {
  page: number;
  pageCount: number;
  limit: number;
  itemCount: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function MyProductsPagination({
  page,
  pageCount,
  limit,
  itemCount,
  hasNextPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: MyProductsPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-muted-foreground text-sm">
        Page {page} · Showing {itemCount} / {limit} items
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPreviousPage}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: pageCount }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={onNextPage}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
