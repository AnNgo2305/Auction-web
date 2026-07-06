import { Trash2, Camera } from 'lucide-react';
import defaultAvatarImageUrl from '@/assets/images/default-avatar.jpg';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/avatar';

type ProfileAvatarProps = {
  avatarImageUrl?: string | null;
  isOwner: boolean;
  isOnline: boolean;
  isLoading?: boolean;
  onUpload: () => void;
  onDelete: () => void;
};

export function ProfileAvatar({
  avatarImageUrl,
  isOwner,
  isOnline,
  isLoading = false,
  onUpload,
  onDelete,
}: ProfileAvatarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!isOwner || isLoading}>
        <Button
          type="button"
          variant="ghost"
          className="size-36 rounded-full p-0 hover:bg-black/10"
        >
          <div className="relative size-full">
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-white text-black">
        <DropdownMenuItem onClick={onUpload} disabled={!isOwner || isLoading}>
          <Camera className="mr-2 h-4 w-4" />
          Change profile photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete your profile photo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
