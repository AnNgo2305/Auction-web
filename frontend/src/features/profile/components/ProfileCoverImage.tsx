import { Camera, Trash2, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import defaultCoverImageUrl from '@/assets/images/default-cover.png';

type ProfileCoverImageProps = {
  coverImageUrl?: string | null;
  isOwner: boolean;
  isLoading?: boolean;
  setUploadCoverImageDialogOpen: (open: boolean) => void;
  setDeleteCoverImageDialogOpen: (open: boolean) => void;
};

export function ProfileCoverImage({
  coverImageUrl,
  isOwner,
  isLoading = false,
  setUploadCoverImageDialogOpen,
  setDeleteCoverImageDialogOpen,
}: ProfileCoverImageProps) {
  const handleOpenUploadDialog = () => {
    if (isLoading) return;

    setUploadCoverImageDialogOpen(true);
  };

  const handleOpenDeleteDialog = () => {
    if (isLoading) return;

    setDeleteCoverImageDialogOpen(true);
  };

  const hasCoverImage = Boolean(coverImageUrl);

  return (
    <div className="bg-muted relative h-64 w-full overflow-hidden rounded-xl">
      <img
        src={coverImageUrl || defaultCoverImageUrl}
        alt="Cover"
        className="h-full w-full object-cover"
      />
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="h-full w-full rounded-none opacity-60" />
        </div>
      )}
      {isOwner && (
        <div className="absolute right-4 bottom-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="bg-white/90 text-black hover:bg-white"
                disabled={isLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
                {hasCoverImage ? 'Change cover photo' : 'Add cover photo'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-black">
              <DropdownMenuItem
                onClick={handleOpenUploadDialog}
                disabled={isLoading}
                className="text-black focus:bg-gray-100 focus:text-black"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload your cover photo
              </DropdownMenuItem>
              {hasCoverImage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleOpenDeleteDialog}
                    disabled={isLoading}
                    className="text-destructive focus:text-destructive focus:bg-gray-100"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete cover photo
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
