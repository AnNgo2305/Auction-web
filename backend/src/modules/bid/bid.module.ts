import { Module } from '@nestjs/common';
import { BidController } from '@modules/bid/bid.controller';
import { BidGateway } from '@modules/bid/bid.gateway';
import { BidService } from '@modules/bid/services/bid.service';
import { BidIdempotencyService } from '@modules/bid/services/bid-idempotency.service';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  providers: [BidService, BidIdempotencyService, BidGateway],
  controllers: [BidController],
  exports: [BidService],
})
export class BidModule {}
