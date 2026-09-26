import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { Prisma } from '@generated/prisma/client';
import { AuctionStatus } from '@generated/prisma/enums';
import { PaginationResult } from '@common/types/pagination.interface';
import { GetBidsQueryDto } from '@modules/bid/dtos/get-bids.query.dto';
import { AuctionBidResponseDto } from '@modules/bid/dtos/get-auction-bids.response';
import { MyBidResponseDto } from '@modules/bid/dtos/get-my-bids.response.dto';
import {
  ERROR_AUCTION_ENDED,
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_OPEN,
  ERROR_BID_AMOUNT_INVALID,
  ERROR_BID_NOT_FOUND,
} from '@modules/bid/constants/bid.constant';
import { BidResponseDto } from '@modules/bid/dtos/bid.response.dto';
import { GetBidByIdResponseDto } from '@modules/bid/dtos/get-bid-by-id.response.dto';
import { FileService } from '@common/services/file.service';
import { InjectQueue } from '@nestjs/bullmq';
import { AUCTION_QUEUE } from '@common/constants/queue.constant';
import { Queue } from 'bullmq';
import { HighestBidResponseDto } from '@modules/bid/dtos/highest-bid.response.dto';

@Injectable()
export class BidService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly fileService: FileService,

    @InjectQueue(AUCTION_QUEUE.NAME)
    private readonly auctionQueue: Queue,
  ) {}

  async placeBid(
    userId: string,
    auctionId: string,
    bidAmount: number,
  ): Promise<BidResponseDto> {
    const result = await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        {
          auctionId: string;
          title: string;
          sellerId: string;
          status: AuctionStatus;
          currentPrice: Prisma.Decimal;
          minimumBidIncrement: Prisma.Decimal;
          endTime: Date;
        }[]
      >`
        SELECT
          auction_id AS "auctionId",
          title,
          seller_id AS "sellerId",
          status,
          current_price AS "currentPrice",
          minimum_bid_increment AS "minimumBidIncrement",
          end_time AS "endTime"
        FROM auctions
        WHERE auction_id = ${auctionId}
        FOR UPDATE
      `;

      const auction = auctions[0];
      if (!auction) {
        this.logger.warn(
          `User ${userId} attempted to bid on non-existent auction ${auctionId}`,
        );
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      this.validateAuctionForBid(auction, userId, auctionId);
      this.validateAuctionNotEnded(auction.endTime);

      const bidAmountDecimal = new Prisma.Decimal(bidAmount);

      this.validateBidAmount(
        bidAmountDecimal,
        auction.currentPrice,
        auction.minimumBidIncrement,
        userId,
        auctionId,
      );

      const bid = await tx.bid.create({
        data: {
          auctionId,
          userId,
          bidAmount: bidAmountDecimal,
        },
        select: {
          bidId: true,
          bidAmount: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              profile: {
                select: { profileImageUrl: true },
              },
            },
          },
        },
      });

      const { endTime, extended } = this.calculateEndTime(auction.endTime);

      const updatedAuction = await tx.auction.update({
        where: { auctionId },
        data: {
          currentPrice: bidAmount,
          bidCount: { increment: 1 },
          ...(extended && {
            endTime,
            status: AuctionStatus.EXTENDED,
          }),
        },
        select: { endTime: true },
      });

      return {
        bidId: bid.bidId,
        auctionId: auction.auctionId,
        auctionTitle: auction.title,
        username: bid.user.username,
        profileImageUrl: bid.user.profile?.profileImageUrl
          ? this.fileService.getPublicUrl(bid.user.profile.profileImageUrl)
          : null,
        bidAmount: bidAmountDecimal.toNumber(),
        createdAt: bid.createdAt,
        endTime: updatedAuction.endTime,
        extended,
      };
    });

    this.logger.debug(
      `User ${userId} placed bid on auction ${auctionId} with amount ${bidAmount}`,
    );

    if (result.extended) {
      await this.auctionQueue.add(
        AUCTION_QUEUE.JOBS.EXTEND_AUCTION,
        {
          auctionId,
        },
        {
          jobId: `auction-open_${auctionId}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    return result;
  }

  private validateAuctionForBid(
    auction: {
      auctionId: string;
      sellerId: string;
      status: AuctionStatus;
    },
    userId: string,
    auctionId: string,
  ): void {
    if (
      auction.status !== AuctionStatus.OPEN &&
      auction.status !== AuctionStatus.EXTENDED
    ) {
      this.logger.warn(
        `User ${userId} attempted to bid on auction ${auctionId} with invalid status ${auction.status}`,
      );
      throw new BadRequestException(ERROR_AUCTION_NOT_OPEN);
    }
  }

  private validateAuctionNotEnded(endTime: Date): void {
    if (endTime <= new Date()) {
      throw new BadRequestException(ERROR_AUCTION_ENDED);
    }
  }

  private validateBidAmount(
    bidAmount: Prisma.Decimal,
    currentPrice: Prisma.Decimal | null,
    minimumBidIncrement: Prisma.Decimal,
    userId: string,
    auctionId: string,
  ): void {
    const minimumBidAmount = currentPrice
      ? currentPrice.add(minimumBidIncrement)
      : minimumBidIncrement;

    if (bidAmount.lt(minimumBidAmount)) {
      this.logger.warn(
        `User ${userId} attempted invalid bid amount ${bidAmount.toString()} for auction ${auctionId}.`,
      );
      throw new BadRequestException(ERROR_BID_AMOUNT_INVALID);
    }

    if (!currentPrice) {
      return;
    }

    const difference = bidAmount.sub(currentPrice);
    const remainder = difference.mod(minimumBidIncrement);

    if (!remainder.isZero()) {
      this.logger.warn(
        `User ${userId} attempted invalid bid increment ${bidAmount.toString()} for auction ${auctionId}.`,
      );
      throw new BadRequestException(ERROR_BID_AMOUNT_INVALID);
    }
  }

  private calculateEndTime(endTime: Date): {
    endTime: Date;
    extended: boolean;
  } {
    const EXTENSION_THRESHOLD_MS = 2 * 60 * 1000;
    const EXTENSION_DURATION_MS = 2 * 60 * 1000;

    const now = new Date();
    const remainingTimeMs = endTime.getTime() - now.getTime();

    const extended = remainingTimeMs <= EXTENSION_THRESHOLD_MS;

    return {
      endTime: extended
        ? new Date(endTime.getTime() + EXTENSION_DURATION_MS)
        : endTime,
      extended,
    };
  }

  async getMyBids(
    userId: string,
    query: GetBidsQueryDto,
  ): Promise<PaginationResult<MyBidResponseDto>> {
    const { cursor, limit } = query;

    this.logger.log(
      `User ${userId} is fetching bids (cursor=${cursor ?? '-'}, limit=${limit})`,
    );

    const bids = await this.prisma.bid.findMany({
      where: {
        userId,
        isHidden: false,
      },
      include: {
        auction: {
          select: {
            auctionId: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(cursor && {
        cursor: {
          bidId: cursor,
        },
        skip: 1,
      }),
      take: limit + 1,
    });

    const hasNextPage = bids.length > limit;
    const data = hasNextPage ? bids.slice(0, limit) : bids;

    this.logger.debug(
      `User ${userId} fetched ${data.length} bids (hasNextPage=${hasNextPage})`,
    );

    return {
      data: data.map((bid) => ({
        bidId: bid.bidId,
        auctionId: bid.auctionId,
        auctionTitle: bid.auction.title,
        bidAmount: bid.bidAmount.toNumber(),
        createdAt: bid.createdAt,
      })),
      meta: {
        limit,
        itemCount: data.length,
        hasNextPage,
        nextCursor: hasNextPage ? data[data.length - 1].bidId : undefined,
      },
    };
  }

  async getBidsByAuction(
    auctionId: string,
    query: GetBidsQueryDto,
  ): Promise<PaginationResult<AuctionBidResponseDto>> {
    const { cursor, limit } = query;

    const auction = await this.prisma.auction.findUnique({
      where: {
        auctionId,
      },
      select: {
        auctionId: true,
      },
    });

    if (!auction) {
      this.logger.warn(`Auction ${auctionId} not found`);

      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    this.logger.log(
      `Fetching bids for auction ${auctionId} (cursor=${cursor ?? '-'}, limit=${limit})`,
    );

    const bids = await this.prisma.bid.findMany({
      where: {
        auctionId,
        isHidden: false,
      },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            profile: {
              select: { profileImageUrl: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(cursor && {
        cursor: {
          bidId: cursor,
        },
        skip: 1,
      }),
      take: limit + 1,
    });

    const hasNextPage = bids.length > limit;
    const data = hasNextPage ? bids.slice(0, limit) : bids;

    this.logger.debug(
      `Fetched ${data.length} bids for auction ${auctionId} (hasNextPage=${hasNextPage})`,
    );

    return {
      data: data.map((bid) => ({
        bidId: bid.bidId,
        auctionId: bid.auctionId,
        username: bid.user.username,
        profileImageUrl: bid.user.profile?.profileImageUrl
          ? this.fileService.getPublicUrl(bid.user.profile.profileImageUrl)
          : null,
        bidAmount: bid.bidAmount.toNumber(),
        createdAt: bid.createdAt,
      })),
      meta: {
        limit,
        itemCount: data.length,
        hasNextPage,
        nextCursor: hasNextPage ? data[data.length - 1].bidId : undefined,
      },
    };
  }

  async getBidById(bidId: string): Promise<GetBidByIdResponseDto> {
    const bid = await this.prisma.bid.findUnique({
      where: {
        bidId,
      },
      include: {
        auction: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!bid) {
      this.logger.warn(`Bid ${bidId} not found`);
      throw new NotFoundException(ERROR_BID_NOT_FOUND);
    }

    return {
      auctionId: bid.auctionId,
      auctionTitle: bid.auction.title,
      bidAmount: bid.bidAmount.toNumber(),
    };
  }

  async getHighestBid(
    auctionId: string,
  ): Promise<HighestBidResponseDto | null> {
    const auction = await this.prisma.auction.findUnique({
      where: {
        auctionId,
      },
      select: {
        auctionId: true,
      },
    });

    if (!auction) {
      this.logger.warn(`Auction ${auctionId} not found`);
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    const bid = await this.prisma.bid.findFirst({
      where: {
        auctionId,
        isHidden: false,
      },
      orderBy: { bidAmount: 'desc' },
      select: {
        bidId: true,
        auctionId: true,
        bidAmount: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            userId: true,
            profile: {
              select: { profileImageUrl: true },
            },
          },
        },
      },
    });

    if (!bid) {
      return null;
    }

    this.logger.debug(
      `Fetched highest bid for auction ${auctionId}: bidId=${bid.bidId}`,
    );

    return {
      bidId: bid.bidId,
      auctionId: bid.auctionId,
      bidAmount: bid.bidAmount.toNumber(),
      username: bid.user.username,
      userId: bid.user.userId,
      profileImageUrl: bid.user.profile?.profileImageUrl
        ? this.fileService.getPublicUrl(bid.user.profile.profileImageUrl)
        : null,
      createdAt: bid.createdAt,
    };
  }
}
