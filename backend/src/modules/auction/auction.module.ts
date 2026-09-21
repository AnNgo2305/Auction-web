import { Module } from '@nestjs/common';
import { AuctionService } from '@modules/auction/services/auction.service';
import { AuctionController } from '@modules/auction/auction.controller';
import { CommonModule } from '@common/common.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { AuctionProcessor } from '@modules/auction/auction.processor';
import { AuctionScheduler } from '@modules/auction/auction.scheduler';
import { AuctionReconcileService } from '@modules/auction/services/auction-reconcile.service';
import { AuctionGateway } from '@modules/auction/auction.gateway';
import { AuctionWebSocketListener } from '@modules/auction/listeners/auction-websocket.listener';

@Module({
  imports: [CommonModule, PermissionModule],
  providers: [
    AuctionService,
    AuctionReconcileService,
    AuctionProcessor,
    AuctionScheduler,
    AuctionGateway,
    AuctionWebSocketListener,
  ],
  controllers: [AuctionController],
  exports: [AuctionService],
})
export class AuctionModule {}
