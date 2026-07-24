import { LoggerService } from '@common/services/logger.service';
import { FollowService } from '@modules/follow/follow.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@generated/prisma/enums';
import {
  ERROR_PRODUCT_ACCESS_DENIED,
  ERROR_PRODUCT_NOT_FOUND,
} from '@modules/product/product.constant';
import { RelationshipStatus } from '@modules/follow/follow.constant';
import { ERROR_PRODUCT_COMMENT_NOT_ALLOWED } from '@modules/product-comment/product-comment.constant';

@Injectable()
export class ProductPermissionService {
  constructor(
    private readonly followService: FollowService,
    private readonly logger: LoggerService,
  ) {}

  async canViewProduct(
    product: {
      productId: string;
      sellerId: string;
      status: ProductStatus;
    },
    currentUserId?: string,
  ): Promise<void> {
    const relationship = await this.followService.getFollowStatus(
      product.sellerId,
      currentUserId,
    );

    if (relationship.status === RelationshipStatus.BLOCKED) {
      this.logger.warn(
        `User ${currentUserId} is blocked by seller ${product.sellerId} and cannot access product ${product.productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (
      product.sellerId !== currentUserId &&
      product.status !== ProductStatus.READY &&
      product.status !== ProductStatus.AUCTIONING
    ) {
      this.logger.warn(
        `User ${currentUserId ?? 'anonymous'} attempted to access unavailable product ${product.productId} (status: ${product.status})`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }
  }

  canEditProduct(
    product: {
      productId: string;
      sellerId: string;
    },
    currentUserId: string,
  ): void {
    if (product.sellerId !== currentUserId) {
      this.logger.warn(
        `User ${currentUserId} attempted to edit product ${product.productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }
  }

  canEditProducts(
    products: {
      productId: string;
      sellerId: string;
    }[],
    currentUserId: string,
  ): void {
    const forbiddenProducts = products.filter(
      (product) => product.sellerId !== currentUserId,
    );

    if (forbiddenProducts.length === 0) {
      return;
    }

    this.logger.warn(
      `User ${currentUserId} attempted to edit products owned by another user: ${forbiddenProducts
        .map((product) => product.productId)
        .join(', ')}`,
    );

    throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
  }

  async canComment(
    product: {
      productId: string;
      sellerId: string;
      status: ProductStatus;
    },
    currentUserId: string,
  ): Promise<void> {
    await this.canViewProduct(product, currentUserId);

    if (
      product.status !== ProductStatus.AUCTIONING &&
      product.status !== ProductStatus.READY &&
      product.status !== ProductStatus.SOLD
    ) {
      this.logger.warn(
        `User ${currentUserId} attempted to comment on product ${product.productId} with status ${product.status}`,
      );

      throw new BadRequestException(ERROR_PRODUCT_COMMENT_NOT_ALLOWED);
    }
  }
}
