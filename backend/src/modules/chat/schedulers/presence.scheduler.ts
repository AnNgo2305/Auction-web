import { Injectable } from '@nestjs/common';
import { PresenceService } from '@modules/chat/services/presence.service';
import { LoggerService } from '@common/services/logger.service';
import { Cron } from '@nestjs/schedule';
import { PresenceGateway } from '@modules/chat/gateways/presence.gateway';

@Injectable()
export class PresenceReconciler {
  private running = false;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly presenceGateway: PresenceGateway,
    private readonly logger: LoggerService,
  ) {}

  @Cron('*/30 * * * * *')
  async reconcile(): Promise<void> {
    if (this.running) return;

    this.running = true;

    try {
      const liveSocketsByUser =
        await this.presenceGateway.getLiveSocketsByUser();
      const { becameOffline, becameOnline } =
        await this.presenceService.reconcile(liveSocketsByUser);

      for (const userId of becameOffline) {
        this.logger.log(`[PRESENCE] User became offline: ${userId}`);

        await this.presenceGateway.broadcastOfflineToWatchers(userId);
      }

      for (const userId of becameOnline) {
        this.logger.log(`[PRESENCE] User became online: ${userId}`);

        await this.presenceGateway.broadcastOnlineToWatchers(userId);
      }
    } catch (error) {
      this.logger.error('[PRESENCE] Reconciliation failed', error);
    } finally {
      this.running = false;
    }
  }
}
