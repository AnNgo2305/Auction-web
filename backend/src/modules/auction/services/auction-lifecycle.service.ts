import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import {
  ERROR_AUCTION_START_TIME_INVALID,
  ERROR_AUCTION_NOT_FOUND,
  ERROR_AUCTION_NOT_READY,
  ERROR_AUCTION_ALREADY_ENDED,
  ERROR_AUCTION_NOT_OPEN,
  ERROR_AUCTION_INVALID_STATUS,
  ERROR_AUCTION_NOT_COMPLETED,
} from '@modules/auction/constants/auction.constant';
import { AuctionStatus } from '@generated/prisma/enums';
import { Prisma } from '@generated/prisma/client';
import { AuctionPermissionService } from '@modules/permission/auction-permission.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { AuctionEvent } from '@modules/auction/events/auction.event';
import { AuctionStartedEvent } from '@modules/auction/events/auction-start.event';
import { AuctionWinnerEvent } from '@modules/auction/events/auction-winner.event';
import { AuctionReopenedEvent } from '@modules/auction/events/auction-reopen.event';
import { BidService } from '@modules/bid/services/bid.service';
import { AuctionQueueService } from '@modules/auction/services/auction-queue.service';

/**
 * Owns the auction status state machine: confirm -> open -> (extend) ->
 * complete -> close -> (reopen). Triggered by admins, the scheduler
 * (BullMQ processors), or internally (endAuction -> completeAuction).
 * CRUD/read endpoints live in AuctionService instead.
 */
@Injectable()
export class AuctionLifecycleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auctionPermissionService: AuctionPermissionService,
    private readonly bidService: BidService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auctionQueueService: AuctionQueueService,
  ) {}

  async openAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Opening auction ${auctionId}`);

    const auction = await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          status: AuctionStatus;
          sellerId: string;
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

      return auction;
    });

    this.logger.log(`[AUCTION] Auction ${auctionId} opened successfully`);

    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_STARTED,
      new AuctionStartedEvent(
        auction.auctionId,
        auction.sellerId,
        auction.startTime,
        auction.endTime,
      ),
    );
  }

  async endAuction(sellerId: string, auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Seller ${sellerId} ending auction ${auctionId}`);

    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
      select: {
        auctionId: true,
        sellerId: true,
        status: true,
      },
    });

    if (!auction) {
      this.logger.warn(`[AUCTION] Auction ${auctionId} not found`);
      throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
    }

    this.auctionPermissionService.canEndAuction(auction, sellerId);

    // Reuse the shared completion flow.
    await this.completeAuction(auctionId);

    this.logger.log(
      `[AUCTION] Successfully ended auction ${auctionId} manually`,
    );
  }

  async confirmAuction(adminId: string, auctionId: string): Promise<void> {
    this.logger.log(
      `[AUCTION] Admin ${adminId} confirming auction ${auctionId}`,
    );

    const auction = await this.prisma.$transaction(async (tx) => {
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

      return auction;
    });

    this.logger.log(
      `[AUCTION] Admin ${adminId} successfully confirmed auction ${auctionId}`,
    );

    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_CREATED,
      new AuctionEvent(auction.auctionId, auction.sellerId),
    );
  }

  async completeAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Completing auction ${auctionId}`);

    const auction = await this.prisma.$transaction(async (tx) => {
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

      if (
        auction.status !== AuctionStatus.OPEN &&
        auction.status !== AuctionStatus.EXTENDED
      ) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be completed from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_NOT_OPEN);
      }

      await tx.auction.update({
        where: { auctionId },
        data: {
          status: AuctionStatus.COMPLETED,
        },
      });

      return auction;
    });

    await this.auctionQueueService.emitSettleAuction(auction.auctionId);

    this.logger.log(
      `[AUCTION] Auction ${auction.auctionId} completed and settlement job queued`,
    );

    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_ENDED,
      new AuctionEvent(auction.auctionId, auction.sellerId),
    );
  }

  async closeAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Closing auction ${auctionId}`);

    const auction = await this.prisma.$transaction(async (tx) => {
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

      if (auction.status !== AuctionStatus.COMPLETED) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be closed from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_NOT_COMPLETED);
      }

      const highestBid = await this.bidService.getHighestBid(auctionId);
      await tx.auction.update({
        where: { auctionId },
        data: {
          status: AuctionStatus.CLOSED,
          winnerId: highestBid?.userId ?? null,
        },
      });

      return auction;
    });

    this.logger.log(`[AUCTION] Auction ${auctionId} closed successfully`);

    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_CLOSED,
      new AuctionEvent(auction.auctionId, auction.sellerId),
    );
  }

  async reopenAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Reopening auction ${auctionId}`);

    const auction = await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          sellerId: string;
          status: AuctionStatus;
          startingPrice: Prisma.Decimal;
          startTime: Date;
          endTime: Date;
        }>
      >`
      SELECT
        auction_id AS "auctionId",
        seller_id AS "sellerId",
        status,
        starting_price AS "startingPrice",
        start_time AS "startTime",
        end_time AS "endTime"
      FROM auctions
      WHERE auction_id = ${auctionId}
      FOR UPDATE
    `;

      if (auctions.length === 0) {
        this.logger.warn(`[AUCTION] Auction ${auctionId} not found`);
        throw new NotFoundException(ERROR_AUCTION_NOT_FOUND);
      }

      const auction = auctions[0];
      if (auction.status !== AuctionStatus.CLOSED) {
        this.logger.warn(
          `[AUCTION] Auction ${auctionId} cannot be reopened from status ${auction.status}`,
        );
        throw new BadRequestException(ERROR_AUCTION_INVALID_STATUS);
      }

      // Hide bids from the previous bidding round.
      await tx.bid.updateMany({
        where: {
          auctionId,
          isHidden: false,
        },
        data: { isHidden: true },
      });

      const now = new Date();

      // Preserve the original auction duration for the new bidding round.
      const duration = auction.endTime.getTime() - auction.startTime.getTime();
      const newEndTime = new Date(now.getTime() + duration);

      await tx.auction.update({
        where: { auctionId },
        data: {
          status: AuctionStatus.OPEN,
          winnerId: null,
          currentPrice: auction.startingPrice,
          bidCount: 0,
          startTime: now,
          endTime: newEndTime,
          lastBidTime: now,
        },
      });

      return {
        auctionId: auction.auctionId,
        sellerId: auction.sellerId,
        startTime: now,
        endTime: newEndTime,
      };
    });

    // The previous complete job already fired (it's what led to CLOSED).
    // Schedule a new one for the fresh bidding round's endTime.
    await this.auctionQueueService.rescheduleCompleteJob(
      auction.auctionId,
      auction.endTime,
    );

    this.logger.log(
      `[AUCTION] Auction ${auction.auctionId} reopened successfully`,
    );

    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_REOPENED,
      new AuctionReopenedEvent(
        auction.auctionId,
        auction.sellerId,
        auction.startTime,
        auction.endTime,
      ),
    );
  }

  async extendAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Extending auction ${auctionId}`);

    const auction = await this.prisma.$transaction(async (tx) => {
      const auctions = await tx.$queryRaw<
        Array<{
          auctionId: string;
          sellerId: string;
          status: AuctionStatus;
          endTime: Date;
        }>
      >`
      SELECT
        auction_id AS auctionId,
        seller_id AS sellerId,
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

      return {
        auctionId: auction.auctionId,
        sellerId: auction.sellerId,
        endTime: newEndTime,
      };
    });

    this.logger.log(
      `[AUCTION] Successfully processed extension for auction ${auctionId}`,
    );

    if (!auction) {
      return;
    }

    // Reschedule completion job with the new end time.
    await this.auctionQueueService.rescheduleCompleteJob(
      auction.auctionId,
      auction.endTime,
    );

    this.logger.log(
      `[AUCTION] Successfully processed extension for auction ${auctionId}`,
    );

    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_EXTENDED,
      new AuctionEvent(auction.auctionId, auction.sellerId),
    );
  }

  async settleAuction(auctionId: string): Promise<void> {
    this.logger.log(`[AUCTION] Settling auction ${auctionId}`);

    const highestBid = await this.bidService.getHighestBid(auctionId);

    if (!highestBid) {
      this.logger.log(
        `[AUCTION] Auction ${auctionId} has no bids. No winner to settle.`,
      );
      return;
    }

    // Winner has been determined successfully.
    // Emit the internal event after the winner is identified.
    this.eventEmitter.emit(
      INTERNAL_EVENTS.AUCTION_WINNER,
      new AuctionWinnerEvent(
        highestBid.auctionId,
        highestBid.userId,
        highestBid.username,
        highestBid.bidAmount,
        highestBid.profileImageUrl,
      ),
    );

    this.logger.log(
      `[AUCTION] Winner determined for auction ${auctionId}: userId=${highestBid.userId}, bid=${highestBid.bidAmount}`,
    );
  }
}
