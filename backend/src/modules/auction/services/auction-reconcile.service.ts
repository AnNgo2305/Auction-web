import { Injectable } from '@nestjs/common';
import { AuctionStatus } from '@generated/prisma/enums';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { AuctionService } from '@modules/auction/services/auction.service';

@Injectable()
export class AuctionReconcileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly auctionService: AuctionService,
  ) {}

  async reconcileAuctions(): Promise<void> {
    const now = new Date();
    this.logger.log('[AUCTION RECONCILE] Starting reconciliation');

    const auctions = await this.prisma.auction.findMany({
      where: {
        OR: [
          {
            status: AuctionStatus.READY,
            startTime: { lte: now },
          },
          {
            status: {
              in: [AuctionStatus.OPEN, AuctionStatus.EXTENDED],
            },
            endTime: { lte: now },
          },
        ],
      },
      select: {
        auctionId: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    for (const auction of auctions) {
      try {
        if (auction.status === AuctionStatus.READY) {
          await this.auctionService.emitOpenAuction(
            auction.auctionId,
            auction.startTime,
          );

          this.logger.warn(
            `[AUCTION RECONCILE] Re-enqueued OPEN job for ${auction.auctionId}`,
          );

          continue;
        }

        if (
          auction.status === AuctionStatus.OPEN ||
          auction.status === AuctionStatus.EXTENDED
        ) {
          await this.auctionService.emitCompleteAuction(
            auction.auctionId,
            auction.endTime,
          );

          this.logger.warn(
            `[AUCTION RECONCILE] Re-enqueued CLOSE job for ${auction.auctionId}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[AUCTION RECONCILE] Failed for auction ${auction.auctionId}`,
          error,
        );
      }
    }

    this.logger.log(
      `[AUCTION RECONCILE] Completed. Found ${auctions.length} auctions`,
    );
  }
}
