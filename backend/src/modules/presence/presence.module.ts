import { Module } from '@nestjs/common';
import { PresenceService } from '@modules/presence/presence.service';
import { PresenceGateway } from '@modules/presence/gateways/presence.gateway';
import { PresenceReconciler } from '@modules/presence/schedulers/presence.scheduler';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  providers: [PresenceService, PresenceGateway, PresenceReconciler],
  exports: [PresenceService],
})
export class PresenceModule {}
