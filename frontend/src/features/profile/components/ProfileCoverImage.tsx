import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
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
  isInitialProfileLoading?: boolean;
  isProfileRefreshing?: boolean;
  isSaving?: boolean;
  setUploadCoverImageDialogOpen: (open: boolean) => void;
  setDeleteCoverImageDialogOpen: (open: boolean) => void;
};

export function ProfileCoverImage({
  coverImageUrl,
  isOwner,
  isInitialProfileLoading = false,
  isProfileRefreshing = false,
  isSaving = false,
  setUploadCoverImageDialogOpen,
  setDeleteCoverImageDialogOpen,
}: ProfileCoverImageProps) {
  const hasCoverImage = Boolean(coverImageUrl);
  const isDisabled = isProfileRefreshing || isSaving;

  const handleOpenUploadDialog = () => {setUploadCoverImageDialogOpen(true)};
  const handleOpenDeleteDialog = () => {setDeleteCoverImageDialogOpen(true)};

  if (isInitialProfileLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <div className="bg-muted relative h-64 w-full overflow-hidden rounded-xl">
      <img
        src={coverImageUrl || defaultCoverImageUrl}
        alt="Cover"
        className="h-full w-full object-cover transition-opacity"
      />
      {isSaving && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}
      {isOwner && (
        <div className="absolute right-4 bottom-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="bg-white/90 text-black hover:bg-white"
                disabled={isDisabled}
              >
                <Camera className="mr-2 h-4 w-4" />
                {hasCoverImage ? 'Change cover photo' : 'Add cover photo'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-black">
              <DropdownMenuItem
                onClick={handleOpenUploadDialog}
                disabled={isDisabled}
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
                    disabled={isDisabled}
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
