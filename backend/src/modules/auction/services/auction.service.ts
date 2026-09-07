import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
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
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_READY,
  ERROR_AUCTION_ALREADY_ENDED,
  ERROR_AUCTION_NOT_OPEN,
  ERROR_AUCTION_INVALID_STATUS,
} from '@modules/auction/auction.constant';
import { AuctionStatus, ProductStatus } from '@generated/prisma/enums';
import { GetAuctionByIdResponseDto } from '@modules/auction/dtos/get-auction-by-id.response.dto';
import { Prisma } from '@generated/prisma/client';
import { PaginationResult } from '@common/types/pagination.interface';
import { SearchAuctionsQueryDto } from '@modules/auction/dtos/search-auctions.query.dto';
import { SearchAuctionsResponseDto } from '@modules/auction/dtos/search-auctions.response.dto';
import { FileService } from '@common/services/file.service';
import { UpdateAuctionDto } from '@modules/auction/dtos/update-auction.body.dto';
import { AuctionPermissionService } from '@modules/permission/auction-permission.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AUCTION_QUEUE } from '@common/constants/queue.constant';

@Injectable()
export class AuctionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    private readonly auctionPermissionService: AuctionPermissionService,

    @InjectQueue(AUCTION_QUEUE.NAME)
    private readonly auctionQueue: Queue,
  ) {}

  async emitOpenAuction(auctionId: string, startTime: Date): Promise<void> {
    const delay = Math.max(0, startTime.getTime() - Date.now());

    await this.auctionQueue.add(
      AUCTION_QUEUE.JOBS.OPEN_AUCTION,
      {
        auctionId,
      },
      {
        delay,
        jobId: `auction-open_${auctionId}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`[AUCTION] Open job emitted for auction ${auctionId}`);
  }

  async emitCompleteAuction(auctionId: string, endTime: Date): Promise<void> {
    const delay = Math.max(0, endTime.getTime() - Date.now());

    await this.auctionQueue.add(
      AUCTION_QUEUE.JOBS.COMPLETE_AUCTION,
      {
        auctionId,
      },
      {
        delay,
        jobId: `auction-complete_${auctionId}_${endTime.getTime()}`,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`[AUCTION] Close job emitted for auction ${auctionId}`);
  }

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
      const products = await this.getAndValidateAuctionProducts(tx, productIds);
      this.logger.log(
        `[AUCTION] Locked ${products.length} products for seller ${sellerId}`,
      );

      const hasUnauthorizedProduct = products.some(
        (product) => product.sellerId !== sellerId,
      );
      if (hasUnauthorizedProduct) {
        this.logger.warn(
          `[AUCTION] Seller ${sellerId} attempted to auction products they do not own`,
        );
        throw new ForbiddenException(ERROR_AUCTION_PRODUCT_ACCESS_DENIED);
      }

      const productMap = new Map(
        products.map((product) => [product.productId, product]),
      );

      const hasInsufficientStock = dto.auctionProducts.some(
        (auctionProduct) => {
          const product = productMap.get(auctionProduct.productId);
          return product && auctionProduct.quantity > product.stockQuantity;
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

    await this.emitOpenAuction(auction.auctionId, auction.startTime);
    await this.emitCompleteAuction(auction.auctionId, auction.endTime);
  }

  async getMyAuctions(
    sellerId: string,
    query: SearchAuctionsQueryDto,
  ): Promise<PaginationResult<SearchAuctionsResponseDto>> {
    this.logger.log(`[AUCTION] Getting auctions for seller ${sellerId}`);

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
      sellerId,
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
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
          select: {
            product: {
              select: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: {
                    imageKey: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: { [sortBy]: sortOrder },
      cursor: cursor ? { auctionId: cursor } : undefined,
      skip: cursor ? 1 : 0,
      take: limit + 1,
    });

    const hasNextPage = auctions.length > limit;
    const items = hasNextPage ? auctions.slice(0, limit) : auctions;

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
        thumbnail: auction.auctionProducts[0]?.product.images[0]?.imageKey
          ? this.fileService.getPublicUrl(
              auction.auctionProducts[0].product.images[0].imageKey,
            )
          : null,
        createdAt: auction.createdAt,
      })),

      meta: {
        limit,
        itemCount: items.length,
        hasNextPage,
        nextCursor: hasNextPage ? items[items.length - 1].auctionId : undefined,
      },
    };
  }

  async getAuctionById(
    auctionId: string,
    currentUserId?: string,
  ): Promise<GetAuctionByIdResponseDto> {
    this.logger.log(`[AUCTION] Getting public auction ${auctionId}`);

    const auction = await this.prisma.auction.findFirst({
      where: {
        auctionId,
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

    this.auctionPermissionService.canViewAuction(auction, currentUserId);

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

  async cancelAuction(
    sellerId: string,
    auctionId: string,
    cancelReason: string,
  ): Promise<void> {
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
      this.auctionPermissionService.canCancelAuction(auction, sellerId);

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
        data: {
          status: AuctionStatus.CANCELED,
          cancelReason,
        },
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

  async endAuction(sellerId: string, auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Seller ${sellerId} ending auction ${auctionId}`);

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
      this.auctionPermissionService.canEndAuction(auction, sellerId);

      await tx.auction.update({
        where: { auctionId },
        data: {
          status: AuctionStatus.COMPLETED,
        },
      });

      this.logger.log(
        `[AUCTION] Auction ${auctionId} ended manually by seller ${sellerId}`,
      );
    });

    // TODO: completeAuction().
    // completeAuction() will contain the shared auction completion logic
    // and will be reused by both manual ending and the BullMQ processor.

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
          startTime: Date;
          endTime: Date;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        seller_id AS sellerId,
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

      if (auction.startTime <= now) {
        throw new BadRequestException(ERROR_AUCTION_START_TIME_INVALID);
      }

      if (auction.endTime <= auction.startTime) {
        throw new BadRequestException(ERROR_AUCTION_END_TIME_INVALID);
      }

      this.auctionPermissionService.canResubmitAuction(auction, sellerId);

      const auctionProducts = await tx.auctionProduct.findMany({
        where: { auctionId },
        select: {
          productId: true,
          quantity: true,
        },
      });

      const productIds = auctionProducts.map((product) => product.productId);

      if (productIds.length > 0) {
        const products = await this.getAndValidateAuctionProducts(
          tx,
          productIds,
          auctionId,
        );

        const productMap = new Map(
          products.map((product) => [product.productId, product]),
        );

        const hasInsufficientStock = auctionProducts.some((auctionProduct) => {
          const product = productMap.get(auctionProduct.productId);
          return product && auctionProduct.quantity > product.stockQuantity;
        });

        if (hasInsufficientStock) {
          this.logger.warn(
            `[AUCTION] Insufficient product stock for resubmission of auction ${auctionId}`,
          );
          throw new BadRequestException(ERROR_AUCTION_PRODUCT_QUANTITY_INVALID);
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
        data: {
          status: AuctionStatus.PENDING,
          cancelReason: null,
        },
      });

      this.logger.log(`[AUCTION] Auction ${auctionId} reopened successfully`);
    });

    this.logger.log(`[AUCTION] Successfully reopened auction ${auctionId}`);
  }

  async confirmAuction(adminId: string, auctionId: string): Promise<void> {
    this.logger.log(
      `[AUCTION] Admin ${adminId} confirming auction ${auctionId}`,
    );

    await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          status: AuctionStatus;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        status
      FROM auctions
      WHERE auction_id = ${auctionId}
      FOR UPDATE
    `;

      if (auctions.length === 0) {
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      const auction = auctions[0];
      if (auction.status !== AuctionStatus.PENDING) {
        throw new BadRequestException(ERROR_AUCTION_INVALID_STATUS);
      }

      await tx.auction.update({
        where: { auctionId },
        data: { status: AuctionStatus.READY },
      });
    });

    this.logger.log(
      `[AUCTION] Admin ${adminId} successfully confirmed auction ${auctionId}`,
    );
  }

  // TODO: Implement completeAuction() later.
  // Handle auction completion: determine the winner and transition the auction to COMPLETED.

  // TODO: Implement closeAuction() later.
  // Handle final settlement: process payment completion and transition the auction to CLOSED.

  // TODO: Implement reopenAuction() later (Controller API).
  // Handle payment timeout: cancel the pending payment and reopen the auction for a new bidding round.

  async extendAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Extending auction ${auctionId}`);

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

      if (
        auction.status !== AuctionStatus.OPEN &&
        auction.status !== AuctionStatus.EXTENDED
      ) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be extended from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_NOT_OPEN);
      }

      const now = new Date();
      if (now >= auction.endTime) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} has already ended`);
        throw new BadRequestException(ERROR_AUCTION_ALREADY_ENDED);
      }

      const remainingTime = auction.endTime.getTime() - now.getTime();
      const extensionWindow = 2 * 60 * 1000;
      const extensionDuration = 2 * 60 * 1000;

      if (remainingTime > extensionWindow) {
        this.logger.debug(
          `[AUCTION] Auction ${auctionId} does not need extension`,
        );
        return;
      }

      const newEndTime = new Date(
        auction.endTime.getTime() + extensionDuration,
      );

      await tx.auction.update({
        where: { auctionId },
        data: {
          endTime: newEndTime,
          status: AuctionStatus.EXTENDED,
        },
      });

      this.logger.log(
        `[AUCTION] Auction ${auctionId} extended until ${newEndTime.toISOString()}`,
      );
    });

    this.logger.log(
      `[AUCTION] Successfully processed extension for auction ${auctionId}`,
    );
  }

  async updateAuction(
    userId: string,
    auctionId: string,
    dto: UpdateAuctionDto,
  ): Promise<void> {
    const {
      title,
      startTime,
      endTime,
      startingPrice,
      minimumBidIncrement,
      auctionProducts,
    } = dto;

    this.logger.log(`User ${userId} is updating auction ${auctionId}`);

    await this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { auctionId },
        select: {
          auctionId: true,
          sellerId: true,
          title: true,
          status: true,
          startTime: true,
          endTime: true,
          auctionProducts: {
            select: {
              productId: true,
              quantity: true,
            },
          },
        },
      });

      if (!auction) {
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      this.auctionPermissionService.canUpdateAuction(auction, userId);

      const now = new Date();
      const newStartTime = startTime ? new Date(startTime) : auction.startTime;
      const newEndTime = endTime ? new Date(endTime) : auction.endTime;

      if (newStartTime <= now) {
        throw new BadRequestException(ERROR_AUCTION_START_TIME_INVALID);
      }

      if (newEndTime <= newStartTime) {
        throw new BadRequestException(ERROR_AUCTION_END_TIME_INVALID);
      }

      if (auctionProducts !== undefined) {
        const newProductIds = auctionProducts.map(
          (product) => product.productId,
        );

        if (new Set(newProductIds).size !== newProductIds.length) {
          throw new BadRequestException(ERROR_AUCTION_DUPLICATE_PRODUCTS);
        }

        const oldProductIds = auction.auctionProducts.map(
          (product) => product.productId,
        );

        const affectedProductIds = [
          ...new Set([...oldProductIds, ...newProductIds]),
        ];

        // Lock old and new products.
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
          WHERE product_id IN (${Prisma.join(affectedProductIds)})
          FOR UPDATE
        `;

        const productMap = new Map(
          products.map((product) => [product.productId, product]),
        );

        // Restore old product reservations first.
        for (const oldAuctionProduct of auction.auctionProducts) {
          const product = productMap.get(oldAuctionProduct.productId)!;
          product.stockQuantity += oldAuctionProduct.quantity;
          product.status = ProductStatus.READY;

          await tx.product.update({
            where: { productId: oldAuctionProduct.productId },
            data: {
              stockQuantity: {
                increment: oldAuctionProduct.quantity,
              },
              status: ProductStatus.READY,
            },
          });
        }

        // Validate only new products after old products are restored.
        const newProducts = await this.getAndValidateAuctionProducts(
          tx,
          newProductIds,
          auctionId,
        );

        const hasUnauthorizedProduct = newProducts.some(
          (product) => product.sellerId !== userId,
        );
        if (hasUnauthorizedProduct) {
          this.logger.warn(
            `[AUCTION] Seller ${userId} attempted to auction products they do not own`,
          );
          throw new ForbiddenException(ERROR_AUCTION_PRODUCT_ACCESS_DENIED);
        }

        const newProductMap = new Map(
          newProducts.map((product) => [product.productId, product]),
        );

        const hasInsufficientStock = auctionProducts.some((auctionProduct) => {
          const product = newProductMap.get(auctionProduct.productId);
          return product && auctionProduct.quantity > product.stockQuantity;
        });

        if (hasInsufficientStock) {
          this.logger.warn(
            `[AUCTION] Insufficient product stock for seller ${userId}`,
          );
          throw new BadRequestException(ERROR_AUCTION_PRODUCT_QUANTITY_INVALID);
        }

        // Reserve new product quantities.
        for (const auctionProduct of auctionProducts) {
          const product = productMap.get(auctionProduct.productId)!;
          product.stockQuantity -= auctionProduct.quantity;
          product.status = ProductStatus.AUCTIONING;

          await tx.product.update({
            where: {
              productId: auctionProduct.productId,
            },
            data: {
              stockQuantity: {
                decrement: auctionProduct.quantity,
              },
              status: ProductStatus.AUCTIONING,
            },
          });
        }

        await tx.auctionProduct.deleteMany({
          where: { auctionId },
        });

        await tx.auctionProduct.createMany({
          data: auctionProducts.map((product) => ({
            auctionId,
            productId: product.productId,
            quantity: product.quantity,
          })),
        });
      }

      await tx.auction.update({
        where: { auctionId },
        data: {
          ...(title !== undefined && { title }),
          ...(startTime !== undefined && { startTime: newStartTime }),
          ...(endTime !== undefined && { endTime: newEndTime }),
          ...(startingPrice !== undefined && {
            startingPrice,
            currentPrice: startingPrice,
          }),
          ...(minimumBidIncrement !== undefined && { minimumBidIncrement }),
        },
      });
    });

    this.logger.debug(`User ${userId} updated auction ${auctionId}`);
  }

  private async getAndValidateAuctionProducts(
    tx: Prisma.TransactionClient,
    productIds: string[],
    currentAuctionId?: string,
  ): Promise<
    Array<{
      productId: string;
      sellerId: string;
      status: ProductStatus;
      stockQuantity: number;
    }>
  > {
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
    WHERE product_id IN (${Prisma.join(productIds)})
    FOR UPDATE
  `;

    if (products.length !== productIds.length) {
      throw new BadRequestException(ERROR_AUCTION_PRODUCTS_NOT_FOUND);
    }

    const hasInvalidProductStatus = products.some(
      (product) =>
        product.status !== ProductStatus.READY &&
        product.status !== ProductStatus.AUCTIONING,
    );

    if (hasInvalidProductStatus) {
      throw new BadRequestException(ERROR_AUCTION_PRODUCT_STATUS_INVALID);
    }

    const existingAuctionProducts = await tx.auctionProduct.findMany({
      where: {
        productId: { in: productIds },
        ...(currentAuctionId && {
          auctionId: { not: currentAuctionId },
        }),
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
      throw new ConflictException(ERROR_AUCTION_PRODUCTS_ALREADY_IN_AUCTION);
    }

    return products;
  }
}
