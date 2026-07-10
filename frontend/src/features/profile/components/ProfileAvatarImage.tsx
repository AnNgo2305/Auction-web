import { Camera, Loader2, Trash2 } from 'lucide-react';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

type ProfileAvatarImageProps = {
  avatarImageUrl?: string | null;
  isOwner: boolean;
  isOnline: boolean;
  isInitialProfileLoading?: boolean;
  isProfileRefreshing?: boolean;
  isSaving?: boolean;
  setUploadAvatarImageDialogOpen: (open: boolean) => void;
  setDeleteAvatarImageDialogOpen: (open: boolean) => void;
};

export function ProfileAvatarImage({
  avatarImageUrl,
  isOwner,
  isOnline,
  isInitialProfileLoading = false,
  isProfileRefreshing = false,
  isSaving = false,
  setUploadAvatarImageDialogOpen,
  setDeleteAvatarImageDialogOpen,
}: ProfileAvatarImageProps) {
  const hasAvatarImage = Boolean(avatarImageUrl);
  const isDisabled = isProfileRefreshing || isSaving;

  const handleOpenUploadDialog = () => {setUploadAvatarImageDialogOpen(true)};
  const handleOpenDeleteDialog = () => {setDeleteAvatarImageDialogOpen(true)};

  if (isInitialProfileLoading) {
    return <Skeleton className="size-36 rounded-full" />;
  }

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
      {isSaving && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/35">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
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
          disabled={isDisabled}
        >
          {avatarContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-white text-black">
        <DropdownMenuItem
          onClick={handleOpenUploadDialog}
          disabled={isDisabled}
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
              disabled={isDisabled}
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
