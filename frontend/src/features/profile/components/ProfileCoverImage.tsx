import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import defaultCoverImageUrl from '@/assets/images/default-cover.png';

type ProfileCoverProps = {
  coverImageUrl?: string | null;
  isOwner: boolean;
  onUpload: () => void;
  onDelete: () => void;
  isLoading?: boolean;
};

export function ProfileCover({
  coverImageUrl,
  isOwner,
  onUpload,
  onDelete,
  isLoading = false,
}: ProfileCoverProps) {
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
                <ImagePlus className="mr-2 h-4 w-4" />
                Edit your cover photo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-black">
              <DropdownMenuItem
                onClick={onUpload}
                disabled={isLoading}
                className="text-black focus:bg-gray-100 focus:text-black"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload your cover photo
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onDelete}
                disabled={isLoading}
                className="text-black focus:bg-gray-100 focus:text-black"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete your cover photo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
