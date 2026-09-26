import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AUCTION_QUEUE } from '@common/constants/queue.constant';
import { AuctionLifecycleService } from '@modules/auction/services/auction-lifecycle.service';

interface AuctionJobData {
  auctionId: string;
}

@Processor(AUCTION_QUEUE.NAME)
export class AuctionProcessor extends WorkerHost {
  constructor(
    private readonly auctionLifeCycleService: AuctionLifecycleService,
  ) {
    super();
  }

  async process(job: Job<AuctionJobData>): Promise<void> {
    switch (job.name) {
      case AUCTION_QUEUE.JOBS.OPEN_AUCTION:
        await this.auctionLifeCycleService.openAuction(job.data.auctionId);
        break;

      case AUCTION_QUEUE.JOBS.EXTEND_AUCTION:
        await this.auctionLifeCycleService.extendAuction(job.data.auctionId);
        break;

      case AUCTION_QUEUE.JOBS.COMPLETE_AUCTION:
        await this.auctionLifeCycleService.completeAuction(job.data.auctionId);
        break;

      case AUCTION_QUEUE.JOBS.SETTLE_AUCTION:
        await this.auctionLifeCycleService.settleAuction(job.data.auctionId);
        break;

      case AUCTION_QUEUE.JOBS.CLOSE_AUCTION:
        await this.auctionLifeCycleService.closeAuction(job.data.auctionId);
        break;

      default:
        throw new Error(`Unknown auction job: ${job.name}`);
    }
  }
}
