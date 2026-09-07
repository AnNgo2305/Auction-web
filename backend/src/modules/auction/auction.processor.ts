import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuctionService } from '@modules/auction/services/auction.service';
import { AUCTION_QUEUE } from '@common/constants/queue.constant';

interface AuctionJobData {
  auctionId: string;
}

@Processor(AUCTION_QUEUE.NAME)
export class AuctionProcessor extends WorkerHost {
  constructor(private readonly auctionService: AuctionService) {
    super();
  }

  async process(job: Job<AuctionJobData>): Promise<void> {
    switch (job.name) {
      case AUCTION_QUEUE.JOBS.OPEN_AUCTION:
        await this.auctionService.openAuction(job.data.auctionId);
        break;

      case AUCTION_QUEUE.JOBS.EXTEND_AUCTION:
        await this.auctionService.extendAuction(job.data.auctionId);
        break;

      case AUCTION_QUEUE.JOBS.COMPLETE_AUCTION:
        // TODO: Complete auction
        break;

      default:
        throw new Error(`Unknown auction job: ${job.name}`);
    }
  }
}
