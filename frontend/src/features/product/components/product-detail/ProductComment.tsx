import { useEffect, useRef, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { useGetProductComments } from '@/features/product/hooks/product-comment/useGetProductComments';
import { useCreateProductComment } from '@/features/product/hooks/product-comment/useCreateProductComment';
import { useDeleteProductComment } from '@/features/product/hooks/product-comment/useDeleteProductComment';
import { useUpdateProductComment } from '@/features/product/hooks/product-comment/useUpdateProductComment';
import type { UpdateProductCommentBody } from '@/features/product/schemas/product-comment/update-product-comment.schema';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { ProductCommentItem, ProductCommentSkeleton } from '@/features/product/components/product-detail/ProductCommentItem';
import { useUser } from '@/shared/contexts/UserContext.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle
} from '@/shared/ui/alert-dialog.tsx';

type ProductCommentProps = {
  productId: string;
};

export function ProductComment({
  productId,
}: ProductCommentProps) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { currentUser } = useUser();
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  const createCommentMutation = useCreateProductComment(productId, () => {
    setContent('');
    setRating(undefined);
  });
  const deleteCommentMutation = useDeleteProductComment(productId);
  const updateCommentMutation = useUpdateProductComment(productId);

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetProductComments(productId);

  const comments = data?.comments ?? [];
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          await fetchNextPage();
        }
      },
      {
        root: null,
        threshold: 0.1,
      },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePostComment = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }
    createCommentMutation.mutate({
      content: trimmedContent,
      rating,
    });
  };

  const handleUpdateComment = (
    commentId: string,
    body: UpdateProductCommentBody,
  ) => {
    updateCommentMutation.mutate({
      commentId,
      body,
    });
  };

  const handleConfirmDeleteComment = () => {
    if (!deleteCommentId) return;
    deleteCommentMutation.mutate({ commentId: deleteCommentId });
  };

  const handleOpenDeleteCommentDialog = (commentId: string) => {
    setDeleteCommentId(commentId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setRating((current) =>
                      current === value ? undefined : value,
                    )
                  }
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`size-4 ${
                      value <= (rating ?? 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              );
            })}
            {rating && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRating(undefined)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <Textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setContent('')}
            disabled={!content.trim()}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePostComment}
            disabled={!content.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Post
          </Button>
        </div>
      </div>
      <div className="max-h-125 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductCommentSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <ProductCommentItem
                key={comment.commentId}
                comment={comment}
                isOwner={comment.user.userId === currentUser?.userId}
                isSaving={updateCommentMutation.isPending}
                onSave={handleUpdateComment}
                onOpenDeleteConfirmDialog={handleOpenDeleteCommentDialog}
              />
            ))}
            <div ref={loadMoreRef} className="h-1" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
      <AlertDialog
        open={deleteCommentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteCommentId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteComment}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
