import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { GetMyProductCategoriesResponseDto } from '@modules/product-category/dtos/get-my-product-categories.response.dto';
import {
  ERROR_CATEGORY_NOT_FOUND,
  ERROR_CATEGORIES_NOT_FOUND,
} from '@modules/product-category/product-category.constant';

@Injectable()
export class ProductCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getMyProductCategories(
    userId: string,
  ): Promise<GetMyProductCategoriesResponseDto> {
    const categories = await this.prisma.category.findMany({
      where: {
        createdById: userId,
      },
      select: {
        categoryId: true,
        name: true,
        color: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    this.logger.debug(
      `Retrieved ${categories.length} categories for user ${userId}`,
    );
    return {
      categories,
    };
  }

  async deleteProductCategoryById(
    userId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        categoryId,
        createdById: userId,
      },
      select: {
        categoryId: true,
      },
    });

    if (!category) {
      throw new NotFoundException(ERROR_CATEGORY_NOT_FOUND);
    }

    await this.prisma.category.delete({
      where: {
        categoryId,
      },
    });

    this.logger.debug(`Deleted category ${categoryId} by user ${userId}`);
  }

  async deleteProductCategories(
    userId: string,
    categoryIds: string[],
  ): Promise<void> {
    const count = await this.prisma.category.count({
      where: {
        createdById: userId,
        categoryId: {
          in: categoryIds,
        },
      },
    });

    if (count !== categoryIds.length) {
      throw new NotFoundException(ERROR_CATEGORIES_NOT_FOUND);
    }

    await this.prisma.category.deleteMany({
      where: {
        createdById: userId,
        categoryId: {
          in: categoryIds,
        },
      },
    });

    this.logger.debug(
      `Deleted ${categoryIds.length} categories by user ${userId}`,
    );
  }

  async createProductCategory(
    userId: string,
    name: string,
    color?: string,
  ): Promise<void> {
    const category = await this.prisma.category.create({
      data: {
        createdById: userId,
        name,
        color,
      },
      select: {
        categoryId: true,
        name: true,
        color: true,
      },
    });

    this.logger.debug(
      `Created category ${category.categoryId} by user ${userId}`,
    );
  }

  async updateProductCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<void> {
    const existingCategories = await this.prisma.category.findMany({
      where: { categoryId: { in: categoryIds } },
      select: { categoryId: true },
    });
    const existingIds = existingCategories.map((c) => c.categoryId);
    const missingIds = categoryIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length)
      throw new NotFoundException(ERROR_CATEGORIES_NOT_FOUND);

    await this.prisma.productCategory.deleteMany({ where: { productId } });
    await this.prisma.productCategory.createMany({
      data: categoryIds.map((categoryId) => ({ productId, categoryId })),
    });
  }
}
