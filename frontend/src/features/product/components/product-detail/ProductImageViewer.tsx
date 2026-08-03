import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton.tsx';

const THUMBNAILS_PER_PAGE = 5;

type ProductImageViewerProps = {
  images: {
    imageId: string;
    imageUrl: string;
    isPrimary: boolean;
  }[];
  isOwner: boolean;
  isLoading?: boolean;
  onEnterEditMode?: () => void;
};

export function ProductImageViewer({
  images,
  isOwner,
  onEnterEditMode,
  isLoading = false,
}: ProductImageViewerProps) {
  const initialIndex = useMemo(() => {
    const primaryIndex = images.findIndex((image) => image.isPrimary);
    return primaryIndex >= 0 ? primaryIndex : 0;
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [thumbnailStart, setThumbnailStart] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);

    const start = Math.max(
      0,
      Math.min(initialIndex, Math.max(0, images.length - THUMBNAILS_PER_PAGE)),
    );

    setThumbnailStart(start);
  }, [images, initialIndex]);

  if (images.length === 0) {
    return (
      <div className="bg-background rounded-xl border p-8">
        <div className="text-muted-foreground flex aspect-square items-center justify-center rounded-lg border border-dashed">
          No images
        </div>

        {isOwner && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onEnterEditMode}>
              <Pencil className="mr-2 size-4" />
              Edit Images
            </Button>
          </div>
        )}
      </div>
    );
  }

  const currentImage = images[currentIndex];

  const updateCurrentIndex = (index: number) => {
    setCurrentIndex(index);

    if (index < thumbnailStart) {
      setThumbnailStart(index);
    } else if (index >= thumbnailStart + THUMBNAILS_PER_PAGE) {
      setThumbnailStart(index - THUMBNAILS_PER_PAGE + 1);
    }
  };

  const previous = () => {
    updateCurrentIndex(
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  };

  const next = () => {
    updateCurrentIndex(
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  };

  const visibleImages = images.slice(
    thumbnailStart,
    thumbnailStart + THUMBNAILS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="bg-background rounded-xl border p-6 shadow-sm">
        <div className="space-y-4">
          <div className="relative">
            {isOwner && (
              <Skeleton className="absolute top-4 right-4 z-10 h-9 w-24 rounded-md" />
            )}
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-md" />
            <div className="flex flex-1 justify-center gap-3">
              {Array.from({ length: THUMBNAILS_PER_PAGE }).map((_, index) => (
                <Skeleton key={index} className="size-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {isOwner && (
            <Button size="sm" onClick={onEnterEditMode}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
          )}
        </div>
        <div className="bg-muted relative overflow-hidden rounded-xl border">
          <img
            src={currentImage?.imageUrl}
            alt=""
            className="aspect-square w-full object-contain"
          />

          {images.length > 1 && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-1/2 left-4 -translate-y-1/2"
                onClick={previous}
              >
                <ChevronLeft className="size-5" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                className="absolute top-1/2 right-4 -translate-y-1/2"
                onClick={next}
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setThumbnailStart((prev) => Math.max(0, prev - 1))}
            disabled={thumbnailStart === 0}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex flex-1 items-center justify-center gap-2">
            {visibleImages.map((image, index) => {
              const actualIndex = thumbnailStart + index;

              return (
                <button
                  key={image.imageId}
                  type="button"
                  onClick={() => updateCurrentIndex(actualIndex)}
                  className={[
                    'size-12 overflow-hidden rounded-lg border-2 transition',
                    currentIndex === actualIndex
                      ? 'border-primary'
                      : 'hover:border-border border-transparent',
                  ].join(' ')}
                >
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setThumbnailStart((prev) =>
                Math.min(
                  Math.max(0, images.length - THUMBNAILS_PER_PAGE),
                  prev + 1,
                ),
              )
            }
            disabled={thumbnailStart + THUMBNAILS_PER_PAGE >= images.length}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
