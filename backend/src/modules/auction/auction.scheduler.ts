import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionReconcileService } from '@modules/auction/services/auction-reconcile.service';

@Injectable()
export class AuctionScheduler {
  constructor(
    private readonly auctionReconcileService: AuctionReconcileService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async reconcileAuctions(): Promise<void> {
    await this.auctionReconcileService.reconcileAuctions();
  }
}
