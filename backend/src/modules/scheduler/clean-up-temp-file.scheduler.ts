import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FileService } from '@common/services/file.service';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class CleanUpTempFileScheduler {
  constructor(
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  @Cron('0 3 * * *')
  async handle(): Promise<void> {
    this.logger.log('[SCHEDULER] Starting temp file cleanup');

    try {
      await this.fileService.deleteExpiredTempFiles();

      this.logger.log('[SCHEDULER] Temp file cleanup completed');
    } catch (error) {
      this.logger.error('[SCHEDULER] Temp file cleanup failed', error);
    }
  }
}
