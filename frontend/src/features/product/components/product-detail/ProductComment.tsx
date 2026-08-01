import React, { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Star } from 'lucide-react';
import { useGetProductComments } from '@/features/product/hooks/product-comment/useGetProductComments';
import type { ProductCommentData } from '@/features/product/types/product-comment/get-product-comments.response';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';
import { Textarea } from '@/shared/ui/textarea';

type ProductCommentProps = {
  productId: string;
};

export function ProductComment({
  productId,
}: ProductCommentProps) {
  const [content, setContent] = useState('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
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
          <Button disabled={!content.trim()}>Post</Button>
        </div>
      </div>
      <Separator />
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <CommentSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <React.Fragment key={comment.commentId}>
              <CommentItem comment={comment} />
              {index !== comments.length - 1 && <Separator />}
            </React.Fragment>
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
  );
}

function CommentItem({ comment }: { comment: ProductCommentData }) {
  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.user.profileImageUrl ?? undefined} />
        <AvatarFallback>
          {comment.user.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{comment.user.username}</span>
          {comment.rating !== null && (
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

        <p className="mt-2 text-sm whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

function CommentSkeleton() {
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
