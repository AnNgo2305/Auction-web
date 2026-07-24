import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';
import { ProductPermissionService } from '@modules/permission/product-permission.service';
import {
  ERROR_PRODUCT_COMMENT_ACCESS_DENIED,
  ERROR_PRODUCT_COMMENT_NOT_FOUND,
} from '@modules/product-comment/product-comment.constant';
import { GetProductCommentsResponseDto } from '@modules/product-comment/dtos/get-product-comments.response.dto';

@Injectable()
export class ProductCommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly productPermissionService: ProductPermissionService,
  ) {}

  async createComment(
    userId: string,
    productId: string,
    content: string,
    rating?: number,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        productId: true,
        status: true,
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(
        `User ${userId} attempted to comment on non-existing product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    await this.productPermissionService.canComment(product, userId);

    await this.prisma.productComment.create({
      data: {
        productId,
        userId,
        content,
        rating,
      },
    });

    this.logger.log(`User ${userId} created comment for product ${productId}`);
  }

  async updateComment(
    userId: string,
    productId: string,
    commentId: string,
    content: string,
    rating?: number,
  ): Promise<void> {
    const comment = await this.prisma.productComment.findUnique({
      where: {
        commentId,
      },
      select: {
        commentId: true,
        productId: true,
        userId: true,
      },
    });

    if (!comment) {
      this.logger.warn(
        `User ${userId} attempted to update non-existing comment ${commentId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_COMMENT_NOT_FOUND);
    }

    if (comment.productId !== productId) {
      this.logger.warn(
        `User ${userId} attempted to update comment ${commentId} from invalid product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_COMMENT_NOT_FOUND);
    }

    if (comment.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to update comment ${commentId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_COMMENT_ACCESS_DENIED);
    }

    await this.prisma.productComment.update({
      where: {
        commentId,
      },
      data: {
        content,
        rating,
      },
    });

    this.logger.log(`User ${userId} updated comment ${commentId}`);
  }

  async deleteComment(
    userId: string,
    productId: string,
    commentId: string,
  ): Promise<void> {
    const comment = await this.prisma.productComment.findUnique({
      where: {
        commentId,
      },
      select: {
        commentId: true,
        userId: true,
        productId: true,
      },
    });

    if (!comment) {
      this.logger.warn(
        `User ${userId} attempted to delete non-existing comment ${commentId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_COMMENT_NOT_FOUND);
    }

    if (comment.productId !== productId) {
      this.logger.warn(
        `User ${userId} attempted to delete comment ${commentId} from invalid product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_COMMENT_NOT_FOUND);
    }

    if (comment.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to delete comment ${commentId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_COMMENT_ACCESS_DENIED);
    }

    await this.prisma.productComment.delete({
      where: {
        commentId,
      },
    });

    this.logger.log(`User ${userId} deleted comment ${commentId}`);
  }

  async getCommentsByProduct(
    productId: string,
    currentUserId?: string,
    cursor?: string,
    limit = 10,
  ): Promise<GetProductCommentsResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        productId: true,
        sellerId: true,
        status: true,
      },
    });

    if (!product) {
      this.logger.warn(
        `User ${currentUserId ?? 'anonymous'} attempted to retrieve comments for non-existing product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    await this.productPermissionService.canViewProduct(product, currentUserId);

    this.logger.log(
      `Retrieving comments for product ${productId} (cursor=${cursor ?? 'null'}, limit=${limit})`,
    );

    const comments = await this.prisma.productComment.findMany({
      where: {
        productId,
      },
      take: limit + 1,
      ...(cursor && {
        cursor: {
          commentId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        commentId: true,
        content: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            userId: true,
            username: true,
            profile: {
              select: {
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = comments.length > limit;
    const sliced = hasMore ? comments.slice(0, limit) : comments;

    this.logger.log(
      `Retrieved ${sliced.length} comments for product ${productId}`,
    );

    return {
      comments: sliced.map((comment) => ({
        commentId: comment.commentId,
        content: comment.content,
        rating: comment.rating,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: {
          userId: comment.user.userId,
          username: comment.user.username,
          profileImageUrl: comment.user.profile?.profileImageUrl ?? null,
        },
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].commentId : null,
    };
  }
}
