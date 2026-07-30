import type { ApiResponse } from '@/shared/types/response';

export class ProductCommentUserData {
  userId!: string;

  username!: string;

  profileImageUrl!: string | null;
}

export class ProductCommentData {
  commentId!: string;

  content!: string;

  rating!: number | null;

  createdAt!: string;

  updatedAt!: string;

  user!: ProductCommentUserData;
}

export class GetProductCommentsData {
  comments!: ProductCommentData[];

  nextCursor!: string | null;
}

export type GetProductCommentsResponse = ApiResponse<GetProductCommentsData>;
