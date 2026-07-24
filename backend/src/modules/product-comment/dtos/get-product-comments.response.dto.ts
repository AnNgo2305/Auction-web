export class ProductCommentItemResponseDto {
  commentId: string;
  content: string;
  rating?: number | null;
  createdAt: Date;
  updatedAt: Date;

  user: {
    userId: string;
    username: string;
    profileImageUrl: string | null;
  };
}

export class GetProductCommentsResponseDto {
  comments: ProductCommentItemResponseDto[];

  nextCursor: string | null;
}
