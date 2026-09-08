import { PrismaService } from '@common/services/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '@common/services/logger.service';
import { ERROR_AUCTION_NOT_FOUND } from '@modules/auction/auction.constant';
import { AuctionStatus, Prisma } from '@generated/prisma/client';
import {
  ERROR_AUCTION_ALREADY_IN_WATCHLIST,
  ERROR_AUCTION_NOT_IN_WATCHLIST,
} from '@modules/watchlist/watchlist.constant';
import { WatchlistResponseDto } from '@modules/watchlist/dtos/get-watchlist.response.dto';

@Injectable()
export class WatchlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async addToWatchlist(userId: string, auctionId: string): Promise<void> {
    this.logger.log(`[WATCHLIST] User ${userId} adding auction ${auctionId}`);

    const auction = await this.prisma.auction.findUnique({
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
      },
    });

    if (!auction) {
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    try {
      await this.prisma.watchlist.create({
        data: {
          userId,
          auctionId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(ERROR_AUCTION_ALREADY_IN_WATCHLIST);
      }

      throw error;
    }

    this.logger.log(`[WATCHLIST] User ${userId} added auction ${auctionId}`);
  }

  async removeFromWatchlist(userId: string, auctionId: string): Promise<void> {
    this.logger.log(`[WATCHLIST] User ${userId} removing auction ${auctionId}`);

    try {
      await this.prisma.watchlist.delete({
        where: {
          userId_auctionId: {
            userId,
            auctionId,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(ERROR_AUCTION_NOT_IN_WATCHLIST);
      }

      throw error;
    }

    this.logger.log(`[WATCHLIST] User ${userId} removed auction ${auctionId}`);
  }

  async getMyWatchlist(
    userId: string,
    cursor?: string,
    limit = 10,
  ): Promise<WatchlistResponseDto> {
    this.logger.log(
      `[GET_MY_WATCHLIST] user=${userId} cursor=${cursor ?? 'null'} limit=${limit}`,
    );

    const watchlists = await this.prisma.watchlist.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && {
        cursor: { watchlistId: cursor },
        skip: 1,
      }),
      orderBy: {
        watchlistId: 'desc',
      },
      select: {
        watchlistId: true,
        addedAt: true,
        auction: {
          select: {
            auctionId: true,
            title: true,
            status: true,
            endTime: true,
            currentPrice: true,
          },
        },
      },
    });

    const hasMore = watchlists.length > limit;
    const sliced = hasMore ? watchlists.slice(0, limit) : watchlists;

    this.logger.log(
      `[GET_MY_WATCHLIST] found=${sliced.length} hasMore=${hasMore} user=${userId}`,
    );

    return {
      watchlists: sliced.map((watchlist) => ({
        watchlistId: watchlist.watchlistId,
        auctionId: watchlist.auction.auctionId,
        title: watchlist.auction.title,
        status: watchlist.auction.status,
        endTime: watchlist.auction.endTime,
        currentPrice: Number(watchlist.auction.currentPrice),
      })),
      nextCursor: hasMore ? sliced[sliced.length - 1].watchlistId : null,
    };
  }
}
