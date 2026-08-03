import { formatDistanceToNow } from 'date-fns';
import { Loader2, Pencil, Star, Trash2 } from 'lucide-react';
import type { UpdateProductCommentBody } from '@/features/product/schemas/product-comment/update-product-comment.schema';
import type { ProductCommentData } from '@/features/product/types/product-comment/get-product-comments.response';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useEffect, useState } from 'react';
import { Textarea } from '@/shared/ui/textarea.tsx';

type ProductCommentItemProps = {
  comment: ProductCommentData;
  isOwner: boolean;
  isSaving?: boolean;
  onSave?: (commentId: string, data: UpdateProductCommentBody) => void;
  onOpenDeleteConfirmDialog?: (commentId: string) => void;
};

export function ProductCommentSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="size-10 rounded-full" />

      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function ProductCommentItem({
  comment,
  isOwner,
  isSaving = false,
  onSave,
  onOpenDeleteConfirmDialog,
}: ProductCommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [rating, setRating] = useState<number | undefined>(
    comment.rating ?? undefined,
  );

  useEffect(() => {
    setContent(comment.content);
    setRating(comment.rating ?? undefined);
  }, [comment]);

  const handleCancel = () => {
    setEditing(false);
    setContent(comment.content);
    setRating(comment.rating ?? undefined);
  };

  const handleSave = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    onSave?.(comment.commentId, {
      content: trimmedContent,
      rating,
    });

    setEditing(false);
  };

  return (
    <div className="group flex gap-4">
      <Avatar>
        <AvatarImage src={comment.user.profileImageUrl ?? undefined} />
        <AvatarFallback>
          {comment.user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-medium">{comment.user.username}</span>

              {!editing && comment.rating !== null && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: comment.rating }).map((_, index) => (
                    <Star
                      key={index}
                      className="size-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              )}

              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {editing ? (
              <div className="space-y-3">
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
                          className={`size-5 ${
                            value <= (rating ?? 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <Textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!content.trim() || isSaving}
                  >
                    {isSaving && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
          {isOwner && !editing && (
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-4" />
              </Button>

              <Button
                size="icon"
                variant="destructive"
                onClick={() => onOpenDeleteConfirmDialog?.(comment.commentId)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
