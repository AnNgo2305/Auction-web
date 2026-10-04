import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoggerService } from '@common/services/logger.service';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { AuctionWinnerEvent } from '@modules/auction/events/auction-winner.event';
import { OrderService } from '@modules/order/order.service';

@Injectable()
export class OrderListener {
  constructor(
    private readonly logger: LoggerService,
    private readonly orderService: OrderService,
  ) {}

  @OnEvent(INTERNAL_EVENTS.AUCTION_WINNER)
  async handle(event: AuctionWinnerEvent): Promise<void> {
    this.logger.log(
      `[ORDER] Handling auction winner: auctionId=${event.auctionId}, winner=${event.winnerId}`,
    );

    await this.orderService.createOrder(event.auctionId);

    this.logger.log(`[ORDER] Order created for auction ${event.auctionId}`);
  }
}
