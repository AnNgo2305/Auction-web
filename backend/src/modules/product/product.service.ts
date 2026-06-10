import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileService } from '@common/services/file.service';
import { PrismaService } from '@common/services/prisma.service';
import { CreateProductDto } from '@modules/product/dtos/create-product.body.dto';
import { GetProductResponseDto } from '@modules/product/dtos/get-product.response.dto';
import {
  ERROR_CANNOT_SET_STATUS_SOLD,
  ERROR_CANNOT_UPDATE_SOLD_PRODUCT,
  ERROR_CATEGORIES_NOT_FOUND,
  ERROR_NO_PRODUCTS_PROVIDED,
  ERROR_PRODUCT_NOT_AVAILABLE,
  ERROR_PRODUCT_NOT_FOUND,
  ERROR_PRODUCT_STOCK_INSUFFICIENT,
} from '@modules/product/product.constant';
import { Prisma } from '@generated/prisma/client';
import { ProductStatus } from '@generated/prisma/enums';
import { ProductDto } from '@modules/product/dtos/multi-products.response.dto';
import { ProductImageService } from '@modules/product-image/product-image.service';
import { ProductCategoryService } from '@modules/product-category/product-category.service';
import { UpdateProductDto } from '@modules/product/dtos/update-product.body.dto';
import { GetProductsQueryDto } from '@modules/product/dtos/get-product.query.dto';
import { PaginationResult } from '@common/types/pagination.interface';

@Injectable()
export class ProductService {
  constructor(
    private readonly fileService: FileService,
    private readonly prisma: PrismaService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly productImageService: ProductImageService,
  ) {}

  async getProductById(
    productId: string,
    currentUserId?: string,
  ): Promise<GetProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        seller: { select: { userId: true, username: true } },
        productCategories: {
          include: { category: { select: { categoryId: true, name: true } } },
        },
        images: true,
      },
    });

    if (!product) throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);

    if (
      product.seller.userId !== currentUserId &&
      (product.status === ProductStatus.SOLD ||
        product.status === ProductStatus.INACTIVE)
    ) {
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

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
      categories: product.productCategories.map((pc) => ({
        categoryId: pc.category.categoryId,
        name: pc.category.name,
      })),
      images: product.images.map((img) => ({
        imageId: img.imageId,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
      })),
    };
  }

  async deleteMultipleProducts(
    userId: string,
    productIds: string[],
  ): Promise<void> {
    if (!productIds || productIds.length === 0) return;

    const existingProducts = await this.prisma.product.findMany({
      where: { productId: { in: productIds }, sellerId: userId },
      include: { images: true },
    });

    const existingIds = existingProducts.map((p) => p.productId);
    const missingIds = productIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    for (const product of existingProducts) {
      for (const img of product.images) {
        await this.fileService.deleteFile(img.imageUrl);
      }
    }

    await this.prisma.product.deleteMany({
      where: {
        productId: { in: productIds },
        sellerId: userId,
      },
    });
  }

  async createProduct(
    userId: string,
    productData: CreateProductDto,
    files?: Express.Multer.File[],
  ): Promise<void> {
    if (!productData) {
      throw new BadRequestException(ERROR_NO_PRODUCTS_PROVIDED);
    }

    const existingCategories = await this.prisma.category.findMany({
      where: { categoryId: { in: productData.categoryIds } },
      select: { categoryId: true },
    });
    const existingIds = existingCategories.map((c) => c.categoryId);
    const missingIds = productData.categoryIds.filter(
      (id) => !existingIds.includes(id),
    );
    if (missingIds.length) {
      throw new BadRequestException(ERROR_CATEGORIES_NOT_FOUND);
    }

    const imagesData: { imageUrl: string; isPrimary: boolean }[] = [];
    if (files && files.length > 0) {
      const MAX_SIZE = 5 * 1024 * 1024;
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      for (const [index, file] of files.entries()) {
        if (file.size > MAX_SIZE)
          throw new Error('File size exceeds 5MB limit');
        if (!allowedMimeTypes.includes(file.mimetype))
          throw new Error(
            'Invalid file type. Only JPEG, PNG, GIF, WEBP are allowed.',
          );

        const imageUrl = await this.fileService.uploadFile('products', file);
        imagesData.push({ imageUrl, isPrimary: index === 0 });
      }
    }

    await this.prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description ?? null,
        stockQuantity: productData.stockQuantity,
        sellerId: userId,
        status: ProductStatus.INACTIVE,
        productCategories: {
          create: productData.categoryIds.map((categoryId) => ({
            category: { connect: { categoryId } },
          })),
        },
        images: imagesData.length > 0 ? { create: imagesData } : undefined,
      },
    });
  }

  async updateProduct(
    userId: string,
    dto: UpdateProductDto,
    files?: Express.Multer.File[],
  ): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { productId: dto.productId },
    });

    if (!product || product.sellerId !== userId) {
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    if (product.status === ProductStatus.SOLD) {
      throw new BadRequestException(ERROR_CANNOT_UPDATE_SOLD_PRODUCT);
    }
    if (dto.status === ProductStatus.SOLD) {
      throw new BadRequestException(ERROR_CANNOT_SET_STATUS_SOLD);
    }

    await this.prisma.product.update({
      where: { productId: dto.productId },
      data: {
        name: dto.name,
        description: dto.description ?? null,
        stockQuantity: dto.stockQuantity,
        status: dto.status,
      },
    });

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.productCategoryService.updateProductCategories(
        dto.productId,
        dto.categoryIds,
      );
    }

    if (files && files.length > 0) {
      await this.productImageService.updateProductImages(dto.productId, files);
    }
  }

  async getProductsByUserId(
    userId: string,
    query: GetProductsQueryDto,
    currentUserId?: string,
  ): Promise<PaginationResult<ProductDto>> {
    const { offset = 0, limit = 10, status, name, categoryId } = query;
    const where = {
      sellerId: userId,
      name: name ? { contains: name } : undefined,
      productCategories: categoryId ? { some: { categoryId } } : undefined,
      status: currentUserId === userId ? status || undefined : 'ACTIVE',
    };

    const [products, totalProducts] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            select: { imageId: true, imageUrl: true, isPrimary: true },
          },
          productCategories: {
            include: { category: { select: { categoryId: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalProducts / limit);

    return {
      data: products.map((p) => ({
        productId: p.productId,
        name: p.name,
        description: p.description ?? undefined,
        stockQuantity: p.stockQuantity,
        status: p.status,
        categories: p.productCategories.map((pc) => ({
          categoryId: pc.category.categoryId,
          name: pc.category.name,
        })),
        images: p.images.map((img) => ({
          imageId: img.imageId,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      meta: {
        totalItems: totalProducts,
        itemCount: products.length,
        itemsPerPage: limit,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  async adjustProductStock(
    tx: Prisma.TransactionClient,
    products: { productId: string; quantity: number }[],
    action: 'decrement' | 'increment' = 'decrement',
  ): Promise<void> {
    const productIds = products.map((p) => p.productId);

    const foundProducts = await tx.product.findMany({
      where: { productId: { in: productIds } },
    });

    if (foundProducts.length !== productIds.length) {
      throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);
    }

    const productMap = new Map(foundProducts.map((p) => [p.productId, p]));

    for (const { productId, quantity } of products) {
      const product = productMap.get(productId);
      if (!product) continue;

      if (product.status !== 'ACTIVE') {
        const { statusCode, message, errorCode } = ERROR_PRODUCT_NOT_AVAILABLE(
          product.name,
        );
        throw new BadRequestException({ statusCode, message, errorCode });
      }

      if (action === 'decrement') {
        if (product.stockQuantity < quantity) {
          const { statusCode, message, errorCode } =
            ERROR_PRODUCT_STOCK_INSUFFICIENT(productId);
          throw new BadRequestException({ statusCode, message, errorCode });
        }
        await tx.product.update({
          where: { productId },
          data: { stockQuantity: { decrement: quantity } },
        });
      } else {
        await tx.product.update({
          where: { productId },
          data: { stockQuantity: { increment: quantity } },
        });
      }
    }
  }
}
