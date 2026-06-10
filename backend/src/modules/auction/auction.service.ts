import { PrismaService } from '@common/services/prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductService } from '@modules/product/product.service';
import { CreateAuctionBodyDto } from '@modules/auction/dtos/create-auction.body.dto';
import { CreateAuctionResponseDto } from '@modules/auction/dtos/create-auction.response.dto';
import {
  ERROR_AUCTION_ALREADY_ENDED,
  ERROR_AUCTION_NOT_CANCELLABLE,
  ERROR_AUCTION_NOT_CLOSABLE,
  ERROR_AUCTION_NOT_CLOSED,
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_OPEN,
  ERROR_AUCTION_NOT_PENDING,
  ERROR_AUCTION_NOT_SELLER,
  ERROR_AUCTION_START_TIME_IN_PAST,
  ERROR_INVALID_AUCTION_TIME,
  ERROR_INVALID_NEW_END_TIME,
} from '@modules/auction/auction.constant';
import { AuctionStatus, Role } from '@generated/prisma/enums';
import { Prisma } from '@generated/prisma/client';
import {
  AuctionProductDetailDto,
  GetAuctionDetailResponseDto,
} from '@modules/auction/dtos/get-auction-detail.response.dto';
import { CancelAuctionDto } from '@modules/auction/dtos/cancel-auction.body.dto';
import { UpdateAuctionBodyDto } from '@modules/auction/dtos/update-auction.body.dto';
import { ERROR_PRODUCT_NOT_FOUND } from '@modules/product/product.constant';
import { SearchAuctionQueryDto } from '@modules/auction/dtos/search-auction.query.dto';
import { PaginationResult } from '@common/types/pagination.interface';
import { AuctionListItemDto } from '@modules/auction/dtos/search-auction.response.dto';
import { ExtendAuctionDto } from '@modules/auction/dtos/extend-auction.body.dto';

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  async createAuction(
    userId: string,
    dto: CreateAuctionBodyDto,
  ): Promise<CreateAuctionResponseDto> {
    const {
      title,
      startTime,
      endTime,
      startingPrice,
      minimumBidIncrement,
      products,
    } = dto;

    const now = new Date();
    if (new Date(startTime) < now) {
      const { statusCode, message, errorCode } =
        ERROR_AUCTION_START_TIME_IN_PAST(now);
      throw new BadRequestException({ statusCode, message, errorCode });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException(ERROR_INVALID_AUCTION_TIME);
    }

    const auction = await this.prisma.$transaction(async (tx) => {
      await this.productService.adjustProductStock(tx, products, 'decrement');
      const createdAuction = await tx.auction.create({
        data: {
          title,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          startingPrice,
          currentPrice: startingPrice,
          minimumBidIncrement,
          lastBidTime: new Date(startTime),
          status: AuctionStatus.PENDING,
          sellerId: userId,
        },
      });

      await tx.auctionProduct.createMany({
        data: products.map(({ productId, quantity }) => ({
          auctionId: createdAuction.auctionId,
          productId,
          quantity,
        })),
      });

      return createdAuction;
    });

    return {
      auctionId: auction.auctionId,
      title: auction.title,
      startTime: auction.startTime,
      endTime: auction.endTime,
      startingPrice: auction.startingPrice.toString(),
      minimumBidIncrement: auction.minimumBidIncrement.toString(),
      status: auction.status,
      products: products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
      })),
    };
  }

  async getAuctionDetail(
    auctionId: string,
  ): Promise<GetAuctionDetailResponseDto> {
    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
      include: {
        seller: { select: { userId: true, username: true } },
        winner: { select: { userId: true, username: true } },
        auctionProducts: {
          include: {
            product: {
              include: {
                productCategories: { include: { category: true } },
                images: true,
              },
            },
          },
        },
        bids: {
          where: { isHidden: false },
          select: { bidId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    return {
      auctionId: auction.auctionId,
      title: auction.title,
      startTime: auction.startTime,
      endTime: auction.endTime,
      startingPrice: auction.startingPrice.toString(),
      currentPrice: auction.currentPrice.toString(),
      minimumBidIncrement: auction.minimumBidIncrement.toString(),
      status: auction.status,
      sellerId: auction.sellerId,
      sellerName: auction.seller.username,
      lastBidTime:
        auction.bids.length > 0 ? auction?.bids?.[0].createdAt : undefined,
      winnerId: auction.winner?.userId ?? undefined,
      winnerName: auction.winner?.username ?? undefined,
      createdAt: auction.createdAt,
      bidCount: auction.bids.length,
      products: auction.auctionProducts.map(
        (ap): AuctionProductDetailDto => ({
          productId: ap.product.productId,
          name: ap.product.name,
          description: ap.product.description || '',
          quantity: ap.quantity,
          categories: ap.product.productCategories.map(
            (pc) => pc.category.name,
          ),
          images: ap.product.images.map((img) => img.imageUrl),
        }),
      ),
    };
  }

  async confirmAuction(auctionId: string): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    if (auction.status !== AuctionStatus.PENDING) {
      throw new BadRequestException(ERROR_AUCTION_NOT_PENDING);
    }

    const now = new Date();
    const newStatus =
      now < auction.startTime ? AuctionStatus.READY : AuctionStatus.OPEN;

    await this.prisma.auction.update({
      where: { auctionId },
      data: {
        status: newStatus,
        lastBidTime: now,
      },
    });
  }

  async cancelAuction(
    auctionId: string,
    cancelAuctionDto: CancelAuctionDto,
  ): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: { auctionId: auctionId },
      include: { auctionProducts: true },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    if (auction.status !== AuctionStatus.PENDING) {
      throw new BadRequestException(ERROR_AUCTION_NOT_CANCELLABLE);
    }

    await this.prisma.$transaction(async (tx) => {
      const productsToRestore = auction.auctionProducts.map((ap) => ({
        productId: ap.productId,
        quantity: ap.quantity,
      }));

      await this.productService.adjustProductStock(
        tx,
        productsToRestore,
        'increment',
      );

      await tx.auction.update({
        where: { auctionId: auctionId },
        data: {
          cancelReason: cancelAuctionDto.reason,
          status: AuctionStatus.CANCELED,
        },
      });
    });
  }

  async closeAuction(
    userId: string,
    userRole: Role,
    auctionId: string,
  ): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    if (userRole !== Role.ADMIN && auction.sellerId !== userId) {
      throw new ForbiddenException(ERROR_AUCTION_NOT_SELLER);
    }

    if (
      auction.status !== AuctionStatus.OPEN &&
      auction.status !== AuctionStatus.EXTENDED
    ) {
      throw new BadRequestException(ERROR_AUCTION_NOT_CLOSABLE);
    }

    await this.prisma.auction.update({
      where: { auctionId },
      data: {
        status: AuctionStatus.CLOSED,
      },
    });
  }

  async updateAuction(
    userId: string,
    auctionId: string,
    dto: UpdateAuctionBodyDto,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { auctionId },
        include: { auctionProducts: true },
      });

      if (!auction) throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      if (auction.sellerId !== userId)
        throw new ForbiddenException(ERROR_AUCTION_NOT_SELLER);
      if (auction.status !== AuctionStatus.PENDING)
        throw new BadRequestException(ERROR_AUCTION_NOT_PENDING);

      const oldProductsMap = new Map(
        auction.auctionProducts.map((ap) => [ap.productId, ap.quantity]),
      );

      const incomingProductIds = dto.products.map((p) => p.productId);

      const products = await tx.product.findMany({
        where: { productId: { in: incomingProductIds } },
      });
      const productMap = new Map(products.map((p) => [p.productId, p]));

      for (const oldProduct of auction.auctionProducts) {
        if (!incomingProductIds.includes(oldProduct.productId)) {
          await this.productService.adjustProductStock(
            tx,
            [
              {
                productId: oldProduct.productId,
                quantity: oldProduct.quantity,
              },
            ],
            'increment',
          );

          await tx.auctionProduct.delete({
            where: {
              auctionId_productId: {
                auctionId,
                productId: oldProduct.productId,
              },
            },
          });
        }
      }

      for (const { productId, quantity } of dto.products) {
        const product = productMap.get(productId);
        if (!product) throw new NotFoundException(ERROR_PRODUCT_NOT_FOUND);

        const oldQty = oldProductsMap.get(productId) ?? 0;
        const diff = quantity - oldQty;

        if (diff > 0) {
          await this.productService.adjustProductStock(
            tx,
            [{ productId, quantity: diff }],
            'decrement',
          );
        } else if (diff < 0) {
          await this.productService.adjustProductStock(
            tx,
            [{ productId, quantity: Math.abs(diff) }],
            'increment',
          );
        }

        if (oldQty === 0) {
          await tx.auctionProduct.create({
            data: { auctionId, productId, quantity },
          });
        } else {
          await tx.auctionProduct.update({
            where: { auctionId_productId: { auctionId, productId } },
            data: { quantity },
          });
        }
      }

      await tx.auction.update({
        where: { auctionId },
        data: {
          title: dto.title,
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          startingPrice: Number(dto.startingPrice),
          minimumBidIncrement: Number(dto.minimumBidIncrement),
        },
      });
    });
  }

  async searchAuctions(
    dto: SearchAuctionQueryDto,
  ): Promise<PaginationResult<AuctionListItemDto>> {
    const {
      sellerId,
      title,
      categoryType,
      status,
      minPrice,
      maxPrice,
      startTime,
      endTime,
      limit = 10,
      offset = 0,
    } = dto;

    const where: Prisma.AuctionWhereInput = {
      sellerId: sellerId ?? undefined,
      title: title ? { contains: title } : undefined,
      status: status ?? undefined,
      currentPrice:
        minPrice !== undefined || maxPrice !== undefined
          ? {
              gte: minPrice ?? undefined,
              lte: maxPrice ?? undefined,
            }
          : undefined,
      startTime:
        startTime || endTime
          ? {
              gte: startTime ? new Date(startTime) : undefined,
              lte: endTime ? new Date(endTime) : undefined,
            }
          : undefined,
      auctionProducts: categoryType?.length
        ? {
            some: {
              product: {
                productCategories: {
                  some: { category: { name: { in: categoryType } } },
                },
              },
            },
          }
        : undefined,
    };

    const [totalItems, auctions] = await Promise.all([
      this.prisma.auction.count({ where }),
      this.prisma.auction.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          seller: { select: { userId: true, username: true } },
        },
        orderBy: { startTime: 'desc' },
      }),
    ]);

    return {
      data: auctions.map((a) => ({
        auctionId: a.auctionId,
        title: a.title,
        sellerId: a.seller.userId,
        sellerName: a.seller.username,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
      meta: {
        totalItems,
        itemCount: auctions.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Math.floor(offset / limit) + 1,
        hasNextPage: offset + limit < totalItems,
        hasPrevPage: offset > 0,
      },
    };
  }

  async reopenAuction(
    userId: string,
    userRole: Role,
    auctionId: string,
  ): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    if (userRole !== Role.ADMIN && auction.sellerId !== userId) {
      throw new ForbiddenException(ERROR_AUCTION_NOT_SELLER);
    }

    if (auction.status !== AuctionStatus.CLOSED) {
      throw new BadRequestException(ERROR_AUCTION_NOT_CLOSED);
    }

    const now = new Date();
    if (now > auction.endTime) {
      throw new BadRequestException(ERROR_AUCTION_ALREADY_ENDED);
    }

    await this.prisma.auction.update({
      where: { auctionId },
      data: {
        status: AuctionStatus.OPEN,
        lastBidTime: now,
      },
    });
  }

  async extendAuction(
    sellerId: string,
    auctionId: string,
    dto: ExtendAuctionDto,
  ): Promise<void> {
    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    if (auction.sellerId !== sellerId) {
      throw new ForbiddenException(ERROR_AUCTION_NOT_SELLER);
    }

    if (
      auction.status !== AuctionStatus.OPEN &&
      auction.status !== AuctionStatus.EXTENDED
    ) {
      throw new BadRequestException(ERROR_AUCTION_NOT_OPEN);
    }

    const now = new Date();
    if (now > auction.endTime) {
      throw new BadRequestException(ERROR_AUCTION_ALREADY_ENDED);
    }

    const newEndTime = new Date(dto.newEndTime);
    if (newEndTime <= auction.endTime) {
      throw new BadRequestException(ERROR_INVALID_NEW_END_TIME);
    }

    await this.prisma.auction.update({
      where: { auctionId },
      data: {
        endTime: newEndTime,
        status: AuctionStatus.EXTENDED,
      },
    });
  }
}
