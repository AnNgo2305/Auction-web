import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '../notification.service';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class DeleteOldNotificationsScheduler {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {}

  @Cron('0 3 * * *')
  async handle(): Promise<void> {
    this.logger.log('[DELETE_OLD_NOTIFICATIONS_SCHEDULER] Starting cleanup');

    try {
      const deleted =
        await this.notificationService.deleteOldReadNotifications();

      this.logger.log(
        `[DELETE_OLD_NOTIFICATIONS_SCHEDULER] Completed deleted=${deleted}`,
      );
    } catch (error) {
      this.logger.error('[DELETE_OLD_NOTIFICATIONS_SCHEDULER] Failed', error);
    }
  }
}
