import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '@common/services/logger.service';
import { AUCTION_QUEUE } from '@common/constants/queue.constant';

/**
 * Centralizes every BullMQ interaction for the auction domain.
 * Both AuctionService (CRUD) and AuctionLifecycleService (status
 * transitions) depend on this instead of injecting the queue directly.
 */
@Injectable()
export class AuctionQueueService {
  constructor(
    private readonly logger: LoggerService,

    @InjectQueue(AUCTION_QUEUE.NAME)
    private readonly auctionQueue: Queue,
  ) {}

  async emitOpenAuction(auctionId: string, startTime: Date): Promise<void> {
    const delay = Math.max(0, startTime.getTime() - Date.now());

    await this.auctionQueue.add(
      AUCTION_QUEUE.JOBS.OPEN_AUCTION,
      { auctionId },
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
    const jobId = `auction-complete_${auctionId}`;

    await this.auctionQueue.add(
      AUCTION_QUEUE.JOBS.COMPLETE_AUCTION,
      { auctionId },
      {
        delay,
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`[AUCTION] Complete job emitted for auction ${auctionId}`);
  }

  async emitSettleAuction(auctionId: string): Promise<void> {
    await this.auctionQueue.add(
      AUCTION_QUEUE.JOBS.SETTLE_AUCTION,
      { auctionId },
      {
        jobId: `auction-settlement_${auctionId}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.auctionQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`[AUCTION] Removed job ${jobId}`);
    }
  }

  /** Removes both the open and complete jobs, used when an auction is cancelled. */
  async removeAuctionJobs(auctionId: string): Promise<void> {
    await this.removeJob(`auction-open_${auctionId}`);
    await this.removeJob(`auction-complete_${auctionId}`);
  }

  async rescheduleOpenJob(auctionId: string, startTime: Date): Promise<void> {
    await this.removeJob(`auction-open_${auctionId}`);
    await this.emitOpenAuction(auctionId, startTime);
  }

  async rescheduleCompleteJob(auctionId: string, endTime: Date): Promise<void> {
    await this.removeJob(`auction-complete_${auctionId}`);
    await this.emitCompleteAuction(auctionId, endTime);
  }
}
