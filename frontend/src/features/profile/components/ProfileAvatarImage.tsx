import { Camera, Trash2 } from 'lucide-react';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';

type ProfileAvatarImageProps = {
  avatarImageUrl?: string | null;
  isOwner: boolean;
  isOnline: boolean;
  isLoading?: boolean;
  setUploadAvatarImageDialogOpen: (open: boolean) => void;
  setDeleteAvatarImageDialogOpen: (open: boolean) => void;
};

export function ProfileAvatarImage({
  avatarImageUrl,
  isOwner,
  isOnline,
  isLoading = false,
  setUploadAvatarImageDialogOpen,
  setDeleteAvatarImageDialogOpen,
}: ProfileAvatarImageProps) {
  const handleOpenUploadDialog = () => {
    if (isLoading) return;

    setUploadAvatarImageDialogOpen(true);
  };

  const handleOpenDeleteDialog = () => {
    if (isLoading) return;

    setDeleteAvatarImageDialogOpen(true);
  };

  const hasAvatarImage = Boolean(avatarImageUrl);

  const avatarContent = (
    <div className="relative size-36">
      <Avatar className="border-background size-full border-4">
        <AvatarImage
          src={avatarImageUrl || defaultAvatarImageUrl}
          alt="Avatar"
        />
        <AvatarFallback>NA</AvatarFallback>
        <AvatarBadge
          className={
            isOnline
              ? 'border-background bg-green-500'
              : 'bg-muted-foreground border-background'
          }
        />
      </Avatar>
      {isLoading && (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-full">
          <Skeleton className="size-full rounded-full opacity-60" />
        </div>
      )}
    </div>
  );

  if (!isOwner) {
    return avatarContent;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="size-36 rounded-full p-0 hover:bg-black/10"
          disabled={isLoading}
        >
          {avatarContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-white text-black">
        <DropdownMenuItem
          onClick={handleOpenUploadDialog}
          disabled={isLoading}
          className="text-black focus:bg-gray-100 focus:text-black"
        >
          <Camera className="mr-2 h-4 w-4" />
          {hasAvatarImage ? 'Change profile photo' : 'Upload profile photo'}
        </DropdownMenuItem>
        {hasAvatarImage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleOpenDeleteDialog}
              className="text-destructive focus:text-destructive focus:bg-gray-100"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete your profile photo
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
