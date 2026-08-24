import { Module } from '@nestjs/common';
import { CleanUpTempFileScheduler } from './clean-up-temp-file.scheduler';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  providers: [CleanUpTempFileScheduler],
})
export class SchedulerModule {}
