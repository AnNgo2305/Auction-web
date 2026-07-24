import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { FileService } from '@common/services/file.service';
import { CreateProductDto } from '@modules/product/dtos/create-product.body.dto';
import { GetProductByIdResponseDto } from '@modules/product/dtos/get-product-by-id.response.dto';
import {
  ERROR_CANNOT_UPDATE_PRODUCT,
  ERROR_CATEGORIES_NOT_FOUND,
  ERROR_PRODUCT_NOT_FOUND,
  ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
  ERROR_PRODUCT_NAME_ALREADY_EXISTS,
} from '@modules/product/product.constant';
import { Prisma } from '@generated/prisma/client';
import { ProductStatus } from '@generated/prisma/enums';
import { ProductCategoryService } from '@modules/product-category/product-category.service';
import { UpdateProductDto } from '@modules/product/dtos/update-product.body.dto';
import { GetMyProductsQueryDto } from '@modules/product/dtos/get-my-products.query.dto';
import { PaginationResult } from '@common/types/pagination.interface';
import { LoggerService } from '@common/services/logger.service';
import { ERROR_CANNOT_SET_PRODUCT_STATUS } from '@modules/product/product.constant';
import { GetMyProductsResponseDto } from '@modules/product/dtos/get-my-products.response.dto';
import { GetProductsResponseDto } from '@modules/product/dtos/get-products.response.dto';
import { GetProductsQueryDto } from '@modules/product/dtos/get-products.query.dto';
import { ProductPermissionService } from '@modules/permission/product-permission.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly productPermissionService: ProductPermissionService,
  ) {}

  private async changeProductStatus(
    userId: string,
    productId: string,
    allowedStatuses: ProductStatus[],
    targetStatus: ProductStatus,
  ): Promise<void> {
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
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    this.productPermissionService.canEditProduct(
      {
        productId,
        sellerId: product.sellerId,
      },
      userId,
    );

    if (!allowedStatuses.includes(product.status)) {
      throw new BadRequestException(
        ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
      );
    }

    await this.prisma.product.update({
      where: {
        productId,
      },
      data: {
        status: targetStatus,
      },
    });

    this.logger.log(
      `User ${userId} changed product ${productId} status from ${product.status} to ${targetStatus}.`,
    );
  }

  private async changeProductsStatus(
    userId: string,
    productIds: string[],
    allowedStatuses: ProductStatus[],
    targetStatus: ProductStatus,
  ): Promise<void> {
    if (productIds.length === 0) {
      return;
    }

    const products = await this.prisma.product.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
        sellerId: true,
        status: true,
      },
    });

    const existingIds = products.map((product) => product.productId);
    const missingIds = productIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      this.logger.warn(
        `User ${userId} attempted to update non-existent products: ${missingIds.join(', ')}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    this.productPermissionService.canEditProducts(products, userId);

    const invalidProducts = products.filter(
      (product) => !allowedStatuses.includes(product.status),
    );

    if (invalidProducts.length > 0) {
      this.logger.warn(
        `User ${userId} attempted invalid status transition for products: ${invalidProducts
          .map((p) => p.productId)
          .join(', ')}`,
      );

      throw new BadRequestException(
        ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED,
      );
    }

    await this.prisma.product.updateMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      data: {
        status: targetStatus,
      },
    });

    this.logger.log(
      `User ${userId} changed status of ${productIds.length} products to ${targetStatus}.`,
    );
  }

  async getProductById(
    productId: string,
    currentUserId?: string,
  ): Promise<GetProductByIdResponseDto> {
    this.logger.log(
      `Retrieving product ${productId} for user ${currentUserId ?? 'anonymous'}`,
    );
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        seller: {
          select: {
            userId: true,
            username: true,
          },
        },
        productCategories: {
          include: {
            category: {
              select: {
                categoryId: true,
                name: true,
              },
            },
          },
        },
        images: true,
        productDocuments: {
          select: {
            documentId: true,
            documentKey: true,
            documentName: true,
          },
        },
      },
    });

    if (!product) {
      this.logger.warn(`Product ${productId} not found`);
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    await this.productPermissionService.canViewProduct(
      {
        productId,
        sellerId: product.sellerId,
        status: product.status,
      },
      currentUserId,
    );

    this.logger.debug(
      `Retrieved product ${productId} successfully for user ${currentUserId ?? 'anonymous'}`,
    );

    return {
      productId: product.productId,
      name: product.name,
      description: product.description ?? undefined,
      stockQuantity: product.stockQuantity,
      status: product.status,
      seller: {
        userId: product.seller.userId,
        username: product.seller.username,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publicCategory: product.publicCategory,
      categories: product.productCategories.map((pc) => ({
        categoryId: pc.category.categoryId,
        name: pc.category.name,
      })),
      images: product.images.map((img) => ({
        imageId: img.imageId,
        imageUrl: this.fileService.getPublicUrl(img.imageKey),
        isPrimary: img.isPrimary,
      })),
      documents: product.productDocuments.map((doc) => ({
        documentId: doc.documentId,
        documentName: doc.documentName,
        documentUrl: this.fileService.getPublicUrl(doc.documentKey),
      })),
    };
  }

  async deleteMultipleProducts(
    userId: string,
    productIds: string[],
  ): Promise<void> {
    if (productIds.length === 0) return;

    const existingProducts = await this.prisma.product.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      include: {
        images: {
          select: {
            imageKey: true,
          },
        },
        productDocuments: {
          select: {
            documentKey: true,
          },
        },
      },
    });

    const existingIds = existingProducts.map((p) => p.productId);
    const missingIds = productIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length > 0) {
      this.logger.warn(
        `User ${userId} attempted to delete non-existing products: ${missingIds.join(', ')}`,
      );
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    this.productPermissionService.canEditProducts(existingProducts, userId);

    this.logger.debug(
      `Deleting files for ${existingProducts.length} products owned by user ${userId}`,
    );

    try {
      await Promise.all([
        ...existingProducts.flatMap((product) =>
          product.images.map((image) =>
            this.fileService.deleteObject(image.imageKey),
          ),
        ),
        ...existingProducts.flatMap((product) =>
          product.productDocuments.map((document) =>
            this.fileService.deleteObject(document.documentKey),
          ),
        ),
      ]);
    } catch (error) {
      this.logger.error(
        `Failed to delete product files for user ${userId}`,
        error,
      );

      throw new Error('Failed to delete product files');
    }

    await this.prisma.product.deleteMany({
      where: {
        sellerId: userId,
        productId: {
          in: productIds,
        },
      },
    });

    this.logger.debug(
      `Deleted ${productIds.length} products by user ${userId}`,
    );
  }

  async deleteProductById(userId: string, productId: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: {
        productId,
      },
      include: {
        images: {
          select: {
            imageKey: true,
          },
        },
        productDocuments: {
          select: {
            documentKey: true,
          },
        },
      },
    });

    if (!product) {
      this.logger.warn(
        `User ${userId} attempted to delete non-existing product ${productId}`,
      );

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    this.productPermissionService.canEditProduct(
      {
        productId: product.productId,
        sellerId: product.sellerId,
      },
      userId,
    );

    this.logger.debug(
      `Deleting files for product ${productId} by user ${userId}`,
    );

    try {
      await Promise.all([
        ...product.images.map((image) =>
          this.fileService.deleteObject(image.imageKey),
        ),
        ...product.productDocuments.map((document) =>
          this.fileService.deleteObject(document.documentKey),
        ),
      ]);

      this.logger.debug(`Deleted all files for product ${productId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete files for product ${productId}`,
        error,
      );

      throw new Error('Failed to delete product files');
    }

    await this.prisma.product.delete({
      where: {
        productId,
      },
    });

    this.logger.debug(`Deleted product ${productId} by user ${userId}`);
  }

  async createProduct(
    userId: string,
    productData: CreateProductDto,
  ): Promise<void> {
    if (productData.categoryIds?.length) {
      const existingCategories = await this.prisma.category.findMany({
        where: {
          categoryId: {
            in: productData.categoryIds,
          },
        },
        select: {
          categoryId: true,
        },
      });

      const existingIds = existingCategories.map((c) => c.categoryId);

      const missingIds = productData.categoryIds.filter(
        (id) => !existingIds.includes(id),
      );

      if (missingIds.length) {
        this.logger.warn(
          `User ${userId} attempted to create a product with invalid category IDs: ${missingIds.join(', ')}`,
        );

        throw new BadRequestException(ERROR_CATEGORIES_NOT_FOUND);
      }
    }

    const existingProduct = await this.prisma.product.findFirst({
      where: {
        sellerId: userId,
        name: productData.name.trim(),
      },
      select: {
        productId: true,
      },
    });

    if (existingProduct) {
      this.logger.warn(
        `User ${userId} attempted to create a duplicate product name: ${productData.name}`,
      );
      throw new ConflictException(ERROR_PRODUCT_NAME_ALREADY_EXISTS);
    }

    await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: productData.name,
          description: productData.description ?? null,
          stockQuantity: productData.stockQuantity,
          sellerId: userId,
          status: productData.status,
          publicCategory: productData.publicCategory,

          productCategories: productData.categoryIds?.length
            ? {
                create: productData.categoryIds.map((categoryId) => ({
                  category: {
                    connect: {
                      categoryId,
                    },
                  },
                })),
              }
            : undefined,
        },
        select: {
          productId: true,
        },
      });

      if (productData.images?.length) {
        await tx.productImage.createMany({
          data: productData.images.map((image) => ({
            productId: product.productId,
            imageKey: image.imageKey,
            isPrimary: image.isPrimary,
          })),
        });
      }

      if (productData.documents?.length) {
        await tx.productDocument.createMany({
          data: productData.documents.map((document) => ({
            productId: product.productId,
            documentName: document.documentName,
            documentKey: document.documentKey,
          })),
        });
      }
    });

    this.logger.debug(`Created product by user ${userId}`);
  }

  async updateProduct(userId: string, dto: UpdateProductDto): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: {
        productId: dto.productId,
      },
    });
    if (!product) {
      this.logger.warn(`Product ${dto.productId} not found`);

      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    this.productPermissionService.canEditProduct(
      {
        productId: dto.productId,
        sellerId: product.sellerId,
      },
      userId,
    );

    if (
      product.status === ProductStatus.SOLD ||
      product.status === ProductStatus.REMOVED
    ) {
      this.logger.warn(
        `User ${userId} cannot update product ${dto.productId} because product status is ${product.status}`,
      );

      throw new BadRequestException(ERROR_CANNOT_UPDATE_PRODUCT);
    }

    if (
      dto.status &&
      (dto.status === ProductStatus.SOLD ||
        dto.status === ProductStatus.AUCTIONING)
    ) {
      this.logger.warn(
        `User ${userId} attempted to set invalid product status ${dto.status} for product ${dto.productId}`,
      );
      throw new BadRequestException(ERROR_CANNOT_SET_PRODUCT_STATUS);
    }

    await this.prisma.product.update({
      where: {
        productId: dto.productId,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.stockQuantity !== undefined && {
          stockQuantity: dto.stockQuantity,
        }),

        ...(dto.publicCategory !== undefined && {
          publicCategory: dto.publicCategory,
        }),

        ...(dto.status !== undefined && {
          status: dto.status,
        }),
      },
    });

    if (dto.categoryIds !== undefined) {
      await this.productCategoryService.updateProductCategories(
        dto.productId,
        dto.categoryIds,
      );
    }

    this.logger.debug(`Updated product ${dto.productId} by user ${userId}`);
  }

  async getMyProducts(
    userId: string,
    query: GetMyProductsQueryDto,
  ): Promise<PaginationResult<GetMyProductsResponseDto>> {
    const {
      keyword,
      status,
      publicCategory,
      categoryId,
      cursor,
      limit,
      sortBy,
      sortOrder,
    } = query;

    this.logger.debug(
      `User ${userId} is fetching products (keyword=${keyword ?? '-'}, status=${status ?? '-'}, publicCategory=${publicCategory ?? '-'}, categoryId=${categoryId ?? '-'}, cursor=${cursor ?? '-'}, limit=${limit}, sortBy=${sortBy}, sortOrder=${sortOrder})`,
    );

    const where: Prisma.ProductWhereInput = {
      sellerId: userId,
      ...(keyword && {
        name: {
          contains: keyword,
        },
      }),
      ...(status && { status }),
      ...(publicCategory && {
        publicCategory,
      }),
      ...(categoryId && {
        productCategories: {
          some: {
            categoryId,
          },
        },
      }),
    };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            imageKey: true,
          },
          take: 1,
        },
        productCategories: {
          include: {
            category: {
              select: {
                categoryId: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      cursor: cursor
        ? {
            productId: cursor,
          }
        : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1,
    });

    const hasNextPage = products.length > limit;
    const items = hasNextPage ? products.slice(0, limit) : products;

    this.logger.debug(
      `User ${userId} fetched ${items.length} products (hasNextPage=${hasNextPage})`,
    );

    return {
      data: items.map((product) => ({
        productId: product.productId,
        name: product.name,
        description: product.description ?? undefined,
        stockQuantity: product.stockQuantity,
        publicCategory: product.publicCategory,
        status: product.status,
        thumbnail: this.fileService.getPublicUrl(product.images[0]?.imageKey),
        categories: product.productCategories.map((pc) => ({
          categoryId: pc.category.categoryId,
          name: pc.category.name,
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
      meta: {
        limit: limit,
        itemCount: items.length,
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].productId : undefined,
      },
    };
  }

  async getProducts(
    query: GetProductsQueryDto,
  ): Promise<PaginationResult<GetProductsResponseDto>> {
    const {
      keyword,
      publicCategory,
      status,
      cursor,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const where: Prisma.ProductWhereInput = {
      ...(keyword && {
        name: {
          contains: keyword,
        },
      }),

      ...(publicCategory && {
        publicCategory,
      }),

      ...(status && {
        status,
      }),
    };

    const products = await this.prisma.product.findMany({
      where,
      take: limit + 1,
      ...(cursor && {
        cursor: {
          productId: cursor,
        },
        skip: 1,
      }),
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        seller: {
          select: {
            username: true,
          },
        },
        productCategories: {
          include: {
            category: {
              select: {
                categoryId: true,
                name: true,
              },
            },
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
          select: {
            imageKey: true,
          },
        },
      },
    });

    const hasNextPage = products.length > limit;
    const data = hasNextPage ? products.slice(0, limit) : products;
    const nextCursor = hasNextPage
      ? data[data.length - 1].productId
      : undefined;

    return {
      data: data.map((product) => ({
        sellerId: product.sellerId,
        sellerName: product.seller.username,
        productId: product.productId,
        name: product.name,
        description: product.description ?? undefined,
        publicCategory: product.publicCategory,
        status: product.status,
        thumbnail: this.fileService.getPublicUrl(product.images[0]?.imageKey),
        categories: product.productCategories.map((item) => ({
          categoryId: item.category.categoryId,
          name: item.category.name,
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),

      meta: {
        limit,
        itemCount: data.length,
        hasNextPage,
        nextCursor,
      },
    };
  }

  async publishProduct(userId: string, productId: string): Promise<void> {
    await this.changeProductStatus(
      userId,
      productId,
      [ProductStatus.DRAFT],
      ProductStatus.READY,
    );
  }

  async removeProduct(userId: string, productId: string): Promise<void> {
    await this.changeProductStatus(
      userId,
      productId,
      [ProductStatus.DRAFT, ProductStatus.READY],
      ProductStatus.REMOVED,
    );
  }

  async restoreProduct(userId: string, productId: string): Promise<void> {
    await this.changeProductStatus(
      userId,
      productId,
      [ProductStatus.REMOVED],
      ProductStatus.DRAFT,
    );
  }

  async publishProducts(userId: string, productIds: string[]): Promise<void> {
    await this.changeProductsStatus(
      userId,
      productIds,
      [ProductStatus.DRAFT],
      ProductStatus.READY,
    );
  }

  async removeProducts(userId: string, productIds: string[]): Promise<void> {
    await this.changeProductsStatus(
      userId,
      productIds,
      [ProductStatus.DRAFT, ProductStatus.READY],
      ProductStatus.REMOVED,
    );
  }

  async restoreProducts(userId: string, productIds: string[]): Promise<void> {
    await this.changeProductsStatus(
      userId,
      productIds,
      [ProductStatus.REMOVED],
      ProductStatus.DRAFT,
    );
  }
}
