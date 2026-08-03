import { Pencil, X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { PublicCategory } from '@/shared/types/product';
import { Skeleton } from '@/shared/ui/skeleton.tsx';

type ProductHeaderProps = {
  name: string;
  publicCategory: PublicCategory;
  isOwner: boolean;
  isEditing: boolean;
  isLoading?: boolean;
  isSaving?: boolean;
  onEnterEditMode?: () => void;
  onExitEditMode?: () => void;
};

export function ProductHeader({
  name,
  publicCategory,
  isOwner,
  isEditing,
  isSaving = false,
  isLoading = false,
  onEnterEditMode,
  onExitEditMode,
}: ProductHeaderProps) {
  if (isLoading) {
    return (
      <div className="bg-background flex flex-col gap-6 rounded-xl border p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    );
  }

  const categoryLabel = publicCategory
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="bg-background flex flex-col gap-6 rounded-xl p-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate text-4xl font-bold tracking-tight">{name}</h1>
          <Badge variant="outline" className="font-medium">
            {categoryLabel}
          </Badge>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {isOwner &&
          (isEditing ? (
            <>
              <Button
                variant="outline"
                className="h-10"
                disabled={isSaving}
                onClick={onExitEditMode}
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button className="h-10" onClick={onEnterEditMode}>
              <Pencil className="mr-2 size-4" />
              Edit Product
            </Button>
          ))}
      </div>
    </div>
  );
}
