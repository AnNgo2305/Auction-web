import { Module } from '@nestjs/common';
import { CommonModule } from '@common/common.module';
import { WatchlistService } from '@modules/watchlist/watchlist.service';
import { WatchlistController } from '@modules/watchlist/watchlist.controller';

@Module({
  imports: [CommonModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
