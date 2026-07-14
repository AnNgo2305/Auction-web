import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useDeleteCoverImage } from '@/features/profile/hooks/profile/useDeleteCoverImage.ts';
import { useDeleteProfileImage } from '@/features/profile/hooks/profile/useDeleteProfileImage.ts';
import { toast } from 'sonner';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '@/shared/contexts/UserContext.tsx';
import { IMAGE_TYPES, type ImageType } from '@/shared/types/user.ts';

type DeleteImageDialogProps = {
  open: boolean;
  type: ImageType;
  onOpenChange: (open: boolean) => void;
  onDeleteImage: (type: ImageType) => void;
};

export function DeleteImageDialog({
  open,
  type,
  onOpenChange,
  onDeleteImage,
}: DeleteImageDialogProps) {
  const imageName = type === IMAGE_TYPES.AVATAR ? 'profile photo' : 'cover photo';
  const { userId } = useParams<{ userId: string }>();
  const { updateProfileImageUrl, updateCoverImageUrl } = useUser();

  const deleteProfileImageMutation = useDeleteProfileImage(
    userId ?? '',
    (res) => {
      updateProfileImageUrl(null);
      toast.success(res.message);
      onDeleteImage(IMAGE_TYPES.AVATAR);
    },
  );

  const deleteCoverImageMutation = useDeleteCoverImage(userId ?? '', (res) => {
    updateCoverImageUrl(null);
    toast.success(res.message);
    onDeleteImage(IMAGE_TYPES.COVER);
  });

  const isDeleting =
    type === IMAGE_TYPES.AVATAR
      ? deleteProfileImageMutation.isPending
      : deleteCoverImageMutation.isPending;

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  const handleDeleteImage = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    try {
      if (type === IMAGE_TYPES.AVATAR) {
        await deleteProfileImageMutation.mutateAsync();
      } else {
        await deleteCoverImageMutation.mutateAsync();
      }
    } catch {}
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {imageName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your {imageName}? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteImage}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

