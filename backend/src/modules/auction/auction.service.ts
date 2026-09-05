import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { CreateAuctionDto } from '@modules/auction/dtos/create-auction.body.dto';
import {
  ERROR_AUCTION_DUPLICATE_PRODUCTS,
  ERROR_AUCTION_END_TIME_INVALID,
  ERROR_AUCTION_PRODUCT_ACCESS_DENIED,
  ERROR_AUCTION_PRODUCTS_ALREADY_IN_AUCTION,
  ERROR_AUCTION_PRODUCTS_NOT_FOUND,
  ERROR_AUCTION_PRODUCT_STATUS_INVALID,
  ERROR_AUCTION_START_TIME_INVALID,
  ERROR_AUCTION_PRODUCT_QUANTITY_INVALID,
  ERROR_AUCTION_ACCESS_DENIED,
  ERROR_AUCTION_CANNOT_CANCEL,
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_READY,
  ERROR_AUCTION_ALREADY_ENDED,
  ERROR_AUCTION_INVALID_STATUS,
} from '@modules/auction/auction.constant';
import { AuctionStatus, ProductStatus } from '@generated/prisma/enums';
import { GetAuctionByIdResponseDto } from '@modules/auction/dtos/get-auction-by-id.response.dto';
import { Prisma } from '@generated/prisma/client';
import { PaginationResult } from '@common/types/pagination.interface';
import { SearchAuctionsQueryDto } from '@modules/auction/dtos/search-auctions.query.dto';
import { SearchAuctionsResponseDto } from '@modules/auction/dtos/search-auctions.response.dto';
import { FileService } from '@common/services/file.service';

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
  ) {}

  async createAuction(sellerId: string, dto: CreateAuctionDto): Promise<void> {
    this.logger.log(`[AUCTION] Creating auction for seller ${sellerId}`);

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const now = new Date();

    if (startTime <= now) {
      this.logger.warn(
        `[AUCTION] Invalid start time for seller ${sellerId}: startTime=${startTime.toISOString()}`,
      );
      throw new BadRequestException(ERROR_AUCTION_START_TIME_INVALID);
    }

    if (startTime >= endTime) {
      this.logger.warn(
        `[AUCTION] Invalid end time for seller ${sellerId}: startTime=${startTime.toISOString()}, endTime=${endTime.toISOString()}`,
      );
      throw new BadRequestException(ERROR_AUCTION_END_TIME_INVALID);
    }

    const productIds = dto.auctionProducts.map((product) => product.productId);
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      this.logger.warn(
        `[AUCTION] Duplicate products detected for seller ${sellerId}: ${productIds.join(', ')}`,
      );
      throw new BadRequestException(ERROR_AUCTION_DUPLICATE_PRODUCTS);
    }

    const auction = await this.prisma.$transaction(async (tx) => {
      const products = await tx.$queryRaw<
        Array<{
          productId: string;
          sellerId: string;
          status: ProductStatus;
          quantity: number;
        }>
      >`
      SELECT
        product_id AS productId,
        seller_id AS sellerId,
        status,
        quantity
      FROM products
      WHERE product_id IN (${productIds.join(',')})
      FOR UPDATE
    `;

      this.logger.log(
        `[AUCTION] Locked ${products.length} products for seller ${sellerId}`,
      );

      if (products.length !== productIds.length) {
        this.logger.warn(
          `[AUCTION] Some products were not found for seller ${sellerId}`,
        );
        throw new NotFoundException(ERROR_AUCTION_PRODUCTS_NOT_FOUND);
      }

      const hasUnauthorizedProduct = products.some(
        (product) => product.sellerId !== sellerId,
      );
      if (hasUnauthorizedProduct) {
        this.logger.warn(
          `[AUCTION] Seller ${sellerId} attempted to auction products they do not own`,
        );
        throw new ForbiddenException(ERROR_AUCTION_PRODUCT_ACCESS_DENIED);
      }

      const hasInvalidProductStatus = products.some(
        (product) => product.status !== ProductStatus.READY,
      );
      if (hasInvalidProductStatus) {
        this.logger.warn(
          `[AUCTION] Some products are not ready for auction for seller ${sellerId}`,
        );
        throw new BadRequestException(ERROR_AUCTION_PRODUCT_STATUS_INVALID);
      }

      const existingAuctionProducts = await tx.auctionProduct.findMany({
        where: {
          productId: { in: productIds },
          auction: {
            status: {
              in: [
                AuctionStatus.PENDING,
                AuctionStatus.READY,
                AuctionStatus.OPEN,
                AuctionStatus.EXTENDED,
              ],
            },
          },
        },
        select: { productId: true },
      });

      if (existingAuctionProducts.length > 0) {
        this.logger.warn(
          `[AUCTION] Products already in active auctions for seller ${sellerId}`,
        );
        throw new BadRequestException(
          ERROR_AUCTION_PRODUCTS_ALREADY_IN_AUCTION,
        );
      }

      const productMap = new Map(
        products.map((product) => [product.productId, product]),
      );

      const hasInsufficientStock = dto.auctionProducts.some(
        (auctionProduct) => {
          const product = productMap.get(auctionProduct.productId);
          return product && auctionProduct.quantity > product.quantity;
        },
      );

      if (hasInsufficientStock) {
        this.logger.warn(
          `[AUCTION] Insufficient product stock for seller ${sellerId}`,
        );

        throw new BadRequestException(ERROR_AUCTION_PRODUCT_QUANTITY_INVALID);
      }

      const auction = await tx.auction.create({
        data: {
          title: dto.title,
          sellerId,
          startTime,
          endTime,
          startingPrice: dto.startingPrice,
          currentPrice: dto.startingPrice,
          minimumBidIncrement: dto.minimumBidIncrement,
          lastBidTime: startTime,
          auctionProducts: {
            create: dto.auctionProducts.map((product) => ({
              productId: product.productId,
              quantity: product.quantity,
            })),
          },
        },
        include: {
          auctionProducts: true,
        },
      });

      for (const auctionProduct of dto.auctionProducts) {
        await tx.product.update({
          where: { productId: auctionProduct.productId },
          data: {
            stockQuantity: {
              decrement: auctionProduct.quantity,
            },
            status: ProductStatus.AUCTIONING,
          },
        });
      }

      this.logger.log(
        `[AUCTION] Reserved ${dto.auctionProducts.length} products for auction ${auction.auctionId}`,
      );
      return auction;
    });

    this.logger.log(
      `[AUCTION] Created auction ${auction.auctionId} by seller ${sellerId}`,
    );
  }

  async getAuctionById(auctionId: string): Promise<GetAuctionByIdResponseDto> {
    this.logger.log(`[AUCTION] Getting public auction ${auctionId}`);

    const auction = await this.prisma.auction.findFirst({
      where: {
        auctionId,
        status: {
          in: [
            AuctionStatus.READY,
            AuctionStatus.OPEN,
            AuctionStatus.EXTENDED,
            AuctionStatus.CLOSED,
            AuctionStatus.COMPLETED,
          ],
        },
      },
      select: {
        auctionId: true,
        sellerId: true,
        title: true,
        startTime: true,
        endTime: true,
        startingPrice: true,
        minimumBidIncrement: true,
        currentPrice: true,
        bidCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        auctionProducts: {
          select: {
            productId: true,
            quantity: true,
            product: {
              select: {
                productId: true,
                name: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { imageKey: true },
                },
              },
            },
          },
        },
      },
    });

    if (!auction) {
      this.logger.warn(`[AUCTION] Public auction ${auctionId} not found`);
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    return {
      auctionId: auction.auctionId,
      sellerId: auction.sellerId,
      title: auction.title,
      startTime: auction.startTime,
      endTime: auction.endTime,
      startingPrice: auction.startingPrice.toNumber(),
      minimumBidIncrement: auction.minimumBidIncrement.toNumber(),
      currentPrice: auction.currentPrice.toNumber(),
      bidCount: Number(auction.bidCount),
      status: auction.status,
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,
      auctionProducts: auction.auctionProducts.map((auctionProduct) => ({
        productId: auctionProduct.product.productId,
        name: auctionProduct.product.name,
        quantity: auctionProduct.quantity,
        thumbnailUrl: auctionProduct.product.images[0]?.imageKey
          ? this.fileService.getPublicUrl(
              auctionProduct.product.images[0].imageKey,
            )
          : null,
      })),
    };
  }

  async searchAuctions(
    query: SearchAuctionsQueryDto,
  ): Promise<PaginationResult<SearchAuctionsResponseDto>> {
    const {
      keyword,
      status,
      minPrice,
      maxPrice,
      startTimeFrom,
      startTimeTo,
      cursor,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const where: Prisma.AuctionWhereInput = {
      status: {
        in: [
          AuctionStatus.READY,
          AuctionStatus.OPEN,
          AuctionStatus.EXTENDED,
          AuctionStatus.CLOSED,
          AuctionStatus.COMPLETED,
        ],
      },

      ...(keyword && {
        OR: [
          {
            title: { contains: keyword },
          },
          {
            auctionProducts: {
              some: {
                product: {
                  name: { contains: keyword },
                },
              },
            },
          },
        ],
      }),

      ...(status && { status }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        currentPrice: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
      ...((startTimeFrom || startTimeTo) && {
        startTime: {
          ...(startTimeFrom && { gte: startTimeFrom }),
          ...(startTimeTo && { lte: startTimeTo }),
        },
      }),
    };

    const auctions = await this.prisma.auction.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      cursor: cursor ? { auctionId: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1,
      select: {
        auctionId: true,
        title: true,
        startTime: true,
        endTime: true,
        startingPrice: true,
        currentPrice: true,
        bidCount: true,
        status: true,
        createdAt: true,
        auctionProducts: {
          take: 1,
          select: {
            product: {
              select: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: { imageKey: true },
                },
              },
            },
          },
        },
      },
    });

    const hasNextPage = auctions.length > limit;
    const items = hasNextPage ? auctions.slice(0, limit) : auctions;

    this.logger.debug(
      `Fetched ${items.length} auctions (hasNextPage=${hasNextPage})`,
    );

    return {
      data: items.map((auction) => ({
        auctionId: auction.auctionId,
        title: auction.title,
        startTime: auction.startTime,
        endTime: auction.endTime,
        startingPrice: auction.startingPrice.toNumber(),
        currentPrice: auction.currentPrice.toNumber(),
        bidCount: Number(auction.bidCount),
        status: auction.status,
        createdAt: auction.createdAt,
        thumbnail: this.fileService.getPublicUrl(
          auction.auctionProducts[0]?.product.images[0]?.imageKey,
        ),
      })),

      meta: {
        limit,
        itemCount: items.length,
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].auctionId : undefined,
      },
    };
  }

  async cancelAuction(sellerId: string, auctionId: string): Promise<void> {
    this.logger.log(
      `[AUCTION] Cancelling auction ${auctionId} by seller ${sellerId}`,
    );

    await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          sellerId: string;
          status: AuctionStatus;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        seller_id AS sellerId,
        status
      FROM auctions
      WHERE auction_id = ${auctionId}
      FOR UPDATE
    `;

      if (auctions.length === 0) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} not found`);
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      const auction = auctions[0];

      if (auction.sellerId !== sellerId) {
        this.logger.warn(
          `[AUCTION] Seller ${sellerId} attempted to cancel auction ${auctionId} they do not own`,
        );
        throw new ForbiddenException(ERROR_AUCTION_ACCESS_DENIED);
      }

      if (
        auction.status !== AuctionStatus.PENDING &&
        auction.status !== AuctionStatus.READY
      ) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be cancelled from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_CANNOT_CANCEL);
      }

      const auctionProducts = await tx.auctionProduct.findMany({
        where: { auctionId },
        select: {
          productId: true,
          quantity: true,
        },
      });

      const productIds = auctionProducts.map((product) => product.productId);

      if (productIds.length > 0) {
        await tx.$queryRaw`
        SELECT product_id
        FROM products
        WHERE product_id IN (${productIds.join(',')})
        FOR UPDATE
      `;

        for (const auctionProduct of auctionProducts) {
          await tx.product.update({
            where: { productId: auctionProduct.productId },
            data: {
              stockQuantity: {
                increment: auctionProduct.quantity,
              },
              status: ProductStatus.READY,
            },
          });
        }
      }

      await tx.auction.update({
        where: { auctionId },
        data: { status: AuctionStatus.CANCELED },
      });

      this.logger.log(
        `[AUCTION] Auction ${auctionId} cancelled and products restored`,
      );
    });

    this.logger.log(`[AUCTION] Successfully cancelled auction ${auctionId}`);
  }

  async openAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Opening auction ${auctionId}`);

    await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          status: AuctionStatus;
          startTime: Date;
          endTime: Date;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        status,
        start_time AS startTime,
        end_time AS endTime
      FROM auctions
      WHERE auction_id = ${auctionId}
      FOR UPDATE
    `;

      if (auctions.length === 0) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} not found`);
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      const auction = auctions[0];
      const now = new Date();

      if (auction.status !== AuctionStatus.READY) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be opened from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_NOT_READY);
      }

      if (now < auction.startTime) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} has not reached its start time`,
        );
        throw new BadRequestException(ERROR_AUCTION_START_TIME_INVALID);
      }

      if (now >= auction.endTime) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} has already ended`);

        throw new BadRequestException(ERROR_AUCTION_ALREADY_ENDED);
      }

      await tx.auction.update({
        where: { auctionId },
        data: { status: AuctionStatus.OPEN },
      });
      this.logger.log(`[AUCTION] Auction ${auctionId} opened successfully`);
    });
  }

  async endAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Ending auction ${auctionId}`);

    await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          status: AuctionStatus;
          endTime: Date;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        status,
        end_time AS endTime
      FROM auctions
      WHERE auction_id = ${auctionId}
      FOR UPDATE
    `;

      if (auctions.length === 0) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} not found`);
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      const auction = auctions[0];
      const now = new Date();

      if (
        auction.status !== AuctionStatus.OPEN &&
        auction.status !== AuctionStatus.EXTENDED
      ) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be ended from status ${auction.status}`,
        );

        throw new BadRequestException(ERROR_AUCTION_INVALID_STATUS);
      }

      if (now < auction.endTime) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} has not reached its end time`,
        );
        throw new BadRequestException(ERROR_AUCTION_ALREADY_ENDED);
      }

      const auctionProducts = await tx.auctionProduct.findMany({
        where: { auctionId },
        select: {
          productId: true,
          quantity: true,
        },
      });

      const productIds = auctionProducts.map((product) => product.productId);
      if (productIds.length > 0) {
        await tx.$queryRaw`
        SELECT product_id
        FROM products
        WHERE product_id IN (${productIds.join(',')})
        FOR UPDATE
      `;

        for (const auctionProduct of auctionProducts) {
          await tx.product.update({
            where: { productId: auctionProduct.productId },
            data: { status: ProductStatus.READY },
          });
        }
      }

      await tx.auction.update({
        where: { auctionId },
        data: { status: AuctionStatus.COMPLETED },
      });

      this.logger.log(`[AUCTION] Auction ${auctionId} ended successfully`);
    });

    this.logger.log(`[AUCTION] Successfully ended auction ${auctionId}`);
  }

  async resubmitAuction(sellerId: string, auctionId: string): Promise<void> {
    this.logger.log(
      `[AUCTION] Reopening auction ${auctionId} by seller ${sellerId}`,
    );

    await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          sellerId: string;
          status: AuctionStatus;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        seller_id AS sellerId,
        status
      FROM auctions
      WHERE auction_id = ${auctionId}
      FOR UPDATE
    `;

      if (auctions.length === 0) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} not found`);
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      const auction = auctions[0];
      if (auction.sellerId !== sellerId) {
        this.logger.warn(
          `[AUCTION] Seller ${sellerId} attempted to reopen auction ${auctionId} they do not own`,
        );
        throw new ForbiddenException(ERROR_AUCTION_ACCESS_DENIED);
      }

      if (auction.status !== AuctionStatus.CANCELED) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be reopened from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_INVALID_STATUS);
      }

      const auctionProducts = await tx.auctionProduct.findMany({
        where: { auctionId },
        select: {
          productId: true,
          quantity: true,
        },
      });

      const productIds = auctionProducts.map((product) => product.productId);

      if (productIds.length > 0) {
        const products = await tx.$queryRaw<
          Array<{
            productId: string;
            sellerId: string;
            status: ProductStatus;
            stockQuantity: number;
          }>
        >`
        SELECT
          product_id AS productId,
          seller_id AS sellerId,
          status,
          stock_quantity AS stockQuantity
        FROM products
        WHERE product_id IN (${productIds.join(',')})
        FOR UPDATE
      `;

        for (const auctionProduct of auctionProducts) {
          const product = products.find(
            (item) => item.productId === auctionProduct.productId,
          );

          if (!product) {
            throw new BadRequestException(ERROR_AUCTION_PRODUCTS_NOT_FOUND);
          }

          if (product.sellerId !== sellerId) {
            throw new ForbiddenException(ERROR_AUCTION_PRODUCT_ACCESS_DENIED);
          }

          if (product.status !== ProductStatus.READY) {
            throw new BadRequestException(ERROR_AUCTION_PRODUCT_STATUS_INVALID);
          }

          if (auctionProduct.quantity > product.stockQuantity) {
            throw new BadRequestException(
              ERROR_AUCTION_PRODUCT_QUANTITY_INVALID,
            );
          }
        }

        for (const auctionProduct of auctionProducts) {
          await tx.product.update({
            where: { productId: auctionProduct.productId },
            data: {
              stockQuantity: {
                decrement: auctionProduct.quantity,
              },
              status: ProductStatus.AUCTIONING,
            },
          });
        }
      }

      await tx.auction.update({
        where: { auctionId },
        data: { status: AuctionStatus.PENDING },
      });

      this.logger.log(`[AUCTION] Auction ${auctionId} reopened successfully`);
    });

    this.logger.log(`[AUCTION] Successfully reopened auction ${auctionId}`);
  }
}
