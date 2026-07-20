import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { FileService } from '@common/services/file.service';
import { LoggerService } from '@common/services/logger.service';
import {
  ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE,
  ERROR_PRODUCT_IMAGE_NOT_FOUND,
  ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED,
} from '@modules/product-image/product-image.constant';
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';

@Injectable()
export class ProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  async updateProductImages(
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
        productId: true,
      },
    });

    if (!product) {
      this.logger.warn(
        `Attempted to update images for non-existing product ${productId}`,
      );
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    const primaryCount = images.filter((image) => image.isPrimary).length;
    if (primaryCount !== 1) {
      throw new BadRequestException(ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED);
    }

    const oldImages = await this.prisma.productImage.findMany({
      where: {
        productId,
      },
      select: {
        imageKey: true,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId,
        },
      });

      await tx.productImage.createMany({
        data: images.map((image) => ({
          productId,
          imageKey: image.imageKey,
          isPrimary: image.isPrimary,
        })),
      });
    });

    try {
      await Promise.all(
        oldImages.map((image) => this.fileService.deleteObject(image.imageKey)),
      );
    } catch (error) {
      this.logger.error(
        `Updated product ${productId} but failed to delete old images from S3`,
        error,
      );

      throw error;
    }

    this.logger.debug(
      `Updated ${images.length} images for product ${productId}`,
    );
  }

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findUnique({
      where: {
        imageId,
        productId,
      },
      select: {
        imageId: true,
        imageKey: true,
      },
    });

    if (!image) {
      this.logger.warn(
        `Attempted to delete non-existing product image ${imageId}`,
      );
      throw new NotFoundException(ERROR_PRODUCT_IMAGE_NOT_FOUND);
    }

    const imageCount = await this.prisma.productImage.count({
      where: {
        productId,
      },
    });

    if (imageCount <= 1) {
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

    await this.prisma.productImage.delete({
      where: {
        imageId,
      },
    });

    this.logger.debug(`Deleted product image ${imageId}`);
  }

  async deleteMultipleProductImages(
    productId: string,
    imageIds: string[],
  ): Promise<void> {
    if (!imageIds.length) {
      return;
    }

    const [existingImages, imagesToDelete] = await Promise.all([
      this.prisma.productImage.findMany({
        where: {
          productId,
        },
        select: {
          imageId: true,
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
        },
      }),
    ]);

    if (imagesToDelete.length !== imageIds.length) {
      this.logger.warn(
        `Attempted to delete non-existing product images from product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_IMAGE_NOT_FOUND);
    }

    if (existingImages.length === imagesToDelete.length) {
      this.logger.warn(
        `Attempted to delete all images of product ${productId}`,
      );

      throw new BadRequestException(ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED);
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

    await this.prisma.productImage.deleteMany({
      where: {
        productId,
        imageId: {
          in: imageIds,
        },
      },
    });

    this.logger.debug(`Deleted ${imageIds.length} product images`);
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findUnique({
      where: {
        imageId,
        productId,
      },
      select: {
        imageId: true,
        productId: true,
      },
    });

    if (!image) {
      this.logger.warn(
        `Attempted to set primary for non-existing product image ${imageId}`,
      );
      throw new NotFoundException(ERROR_PRODUCT_IMAGE_NOT_FOUND);
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
      `Set product image ${imageId} as primary for product ${image.productId}`,
    );
  }
}
