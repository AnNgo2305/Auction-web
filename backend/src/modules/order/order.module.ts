import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderListener } from '@modules/order/order.listener';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [OrderController],
  providers: [OrderService, OrderListener],
  exports: [OrderService],
})
export class OrderModule {}
