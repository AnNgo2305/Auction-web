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

type DeleteImageType = 'avatar' | 'cover';

type DeleteImageDialogProps = {
  open: boolean;
  type: DeleteImageType;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteImage: () => void;
};

export function DeleteImageDialog({
  open,
  type,
  isDeleting = false,
  onOpenChange,
  onDeleteImage,
}: DeleteImageDialogProps) {
  const imageName = type === 'avatar' ? 'profile photo' : 'cover photo';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={(event) => {
              event.preventDefault();
              onDeleteImage();
            }}
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

