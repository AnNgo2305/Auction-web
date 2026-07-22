import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { FileService } from '@common/services/file.service';
import { LoggerService } from '@common/services/logger.service';
import {
  ERROR_PRODUCT_IMAGE_CANNOT_DELETE_ALL_IMAGES,
  ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE,
  ERROR_PRODUCT_IMAGE_NOT_FOUND,
  ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED,
} from '@modules/product-image/product-image.constant';
import {
  ERROR_PRODUCT_ACCESS_DENIED,
  ERROR_PRODUCT_IMAGE_ALREADY_PRIMARY,
  ERROR_PRODUCT_NOT_FOUND,
} from '@modules/product/product.constant';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  async updateProductImages(
    userId: string,
    productId: string,
    images: {
      imageKey: string;
      isPrimary: boolean;
    }[],
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to update images of product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

    const primaryCount = images.filter((image) => image.isPrimary).length;

    if (primaryCount !== 1) {
      throw new BadRequestException(ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED);
    }

    const currentImages = await this.prisma.productImage.findMany({
      where: {
        productId,
      },
      select: {
        imageKey: true,
      },
    });

    const currentKeys = new Set(currentImages.map((image) => image.imageKey));
    const newKeys = new Set(images.map((image) => image.imageKey));

    const deletedKeys = [...currentKeys].filter((key) => !newKeys.has(key));

    const addedImages = images.filter(
      (image) => !currentKeys.has(image.imageKey),
    );

    await this.prisma.$transaction(async (tx) => {
      if (deletedKeys.length > 0) {
        await tx.productImage.deleteMany({
          where: {
            productId,
            imageKey: {
              in: deletedKeys,
            },
          },
        });
      }

      if (addedImages.length > 0) {
        await tx.productImage.createMany({
          data: addedImages.map((image) => ({
            productId,
            imageKey: image.imageKey,
            isPrimary: image.isPrimary,
          })),
        });
      }

      for (const image of images) {
        await tx.productImage.updateMany({
          where: {
            productId,
            imageKey: image.imageKey,
          },
          data: {
            isPrimary: image.isPrimary,
          },
        });
      }
    });

    this.logger.debug(
      `Synchronized ${images.length} images for product ${productId}`,
    );
  }

  async deleteProductImage(
    userId: string,
    productId: string,
    imageId: string,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to delete image from product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

    const image = await this.prisma.productImage.findFirst({
      where: {
        imageId,
        productId,
      },
      select: {
        imageKey: true,
        isPrimary: true,
      },
    });

    if (!image) {
      this.logger.warn(
        `Product image ${imageId} not found for product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_IMAGE_NOT_FOUND);
    }

    const imageCount = await this.prisma.productImage.count({
      where: {
        productId,
      },
    });

    if (imageCount <= 1) {
      this.logger.warn(
        `User ${userId} attempted to delete the last image of product ${productId}`,
      );

      throw new BadRequestException(
        ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE,
      );
    }

    try {
      await this.fileService.deleteObject(image.imageKey);
    } catch (error) {
      this.logger.error(
        `Failed to delete S3 object for product image ${imageId}`,
        error,
      );
      throw error;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.delete({
        where: {
          imageId,
        },
      });

      if (image.isPrimary) {
        const nextPrimary = await tx.productImage.findFirst({
          where: {
            productId,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            imageId: true,
          },
        });

        if (nextPrimary) {
          await tx.productImage.update({
            where: {
              imageId: nextPrimary.imageId,
            },
            data: {
              isPrimary: true,
            },
          });
        }
      }
    });

    this.logger.debug(
      `Deleted product image ${imageId} from product ${productId}`,
    );
  }

  async deleteMultipleProductImages(
    userId: string,
    productId: string,
    imageIds: string[],
  ): Promise<void> {
    if (!imageIds.length) {
      return;
    }

    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to delete images from product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

    const [totalImages, imagesToDelete] = await Promise.all([
      this.prisma.productImage.count({
        where: {
          productId,
        },
      }),

      this.prisma.productImage.findMany({
        where: {
          productId,
          imageId: {
            in: imageIds,
          },
        },
        select: {
          imageId: true,
          imageKey: true,
          isPrimary: true,
        },
      }),
    ]);

    if (imagesToDelete.length !== imageIds.length) {
      this.logger.warn(
        `Attempted to delete non-existing product images from product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_IMAGE_NOT_FOUND);
    }

    if (totalImages - imagesToDelete.length < 1) {
      this.logger.warn(
        `User ${userId} attempted to delete all images of product ${productId}`,
      );

      throw new BadRequestException(
        ERROR_PRODUCT_IMAGE_CANNOT_DELETE_ALL_IMAGES,
      );
    }

    try {
      await Promise.all(
        imagesToDelete.map((image) =>
          this.fileService.deleteObject(image.imageKey),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete one or more product images from S3`,
        error,
      );

      throw error;
    }

    const deletingPrimary = imagesToDelete.some((image) => image.isPrimary);

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId,
          imageId: {
            in: imageIds,
          },
        },
      });

      if (deletingPrimary) {
        const nextPrimary = await tx.productImage.findFirst({
          where: {
            productId,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            imageId: true,
          },
        });

        if (nextPrimary) {
          await tx.productImage.update({
            where: {
              imageId: nextPrimary.imageId,
            },
            data: {
              isPrimary: true,
            },
          });
        }
      }
    });

    this.logger.debug(
      `Deleted ${imageIds.length} product images from product ${productId}`,
    );
  }

  async setPrimaryImage(
    userId: string,
    productId: string,
    imageId: string,
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId,
      },
      select: {
        productId: true,
        sellerId: true,
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.sellerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to modify product ${productId} owned by another user`,
      );

      throw new ForbiddenException(ERROR_PRODUCT_ACCESS_DENIED);
    }

    const image = await this.prisma.productImage.findFirst({
      where: {
        imageId,
        productId,
      },
      select: {
        imageId: true,
        isPrimary: true,
      },
    });

    if (!image) {
      this.logger.warn(
        `Product image ${imageId} not found for product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_IMAGE_NOT_FOUND);
    }

    if (image.isPrimary) {
      this.logger.warn(
        `User ${userId} attempted to set product image ${imageId} as primary, but it is already the primary image`,
      );

      throw new ConflictException(ERROR_PRODUCT_IMAGE_ALREADY_PRIMARY);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: {
          productId,
        },
        data: {
          isPrimary: false,
        },
      });

      await tx.productImage.update({
        where: {
          imageId,
        },
        data: {
          isPrimary: true,
        },
      });
    });

    this.logger.debug(
      `Set product image ${imageId} as primary for product ${productId}`,
    );
  }
}
