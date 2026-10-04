import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { LoggerService } from '@common/services/logger.service';
import { AuctionStatus, OrderStatus } from '@generated/prisma/enums';
import {
  ERROR_ORDER_AUCTION_NO_WINNER,
  ERROR_ORDER_AUCTION_NOT_COMPLETED,
  ERROR_ORDER_NOT_FOUND,
} from '@modules/order/order.constant';
import { GetOrderByIdResponseDto } from '@modules/order/dtos/get-order-by-id.response.dto';
import { MyOrderResponseDto } from '@modules/order/dtos/get-my-orders.response.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async createOrder(auctionId: string): Promise<void> {
    this.logger.log(`Creating order for auction: ${auctionId}`);

    const auction = await this.prisma.auction.findUnique({
      where: { auctionId },
      select: {
        auctionId: true,
        winnerId: true,
        currentPrice: true,
        status: true,
        order: {
          select: { orderId: true },
        },
      },
    });

    if (!auction) {
      this.logger.warn(`Auction not found: ${auctionId}`);
      throw new NotFoundException(ERROR_ORDER_NOT_FOUND);
    }

    if (auction.status !== AuctionStatus.COMPLETED) {
      this.logger.warn(
        `Cannot create order. Auction ${auctionId} has status ${auction.status}`,
      );
      throw new BadRequestException(ERROR_ORDER_AUCTION_NOT_COMPLETED);
    }

    if (!auction.winnerId) {
      this.logger.warn(
        `Cannot create order. Auction ${auctionId} has no winner`,
      );
      throw new BadRequestException(ERROR_ORDER_AUCTION_NO_WINNER);
    }

    // Idempotency: return the existing order if one has already been created.
    if (auction.order) {
      this.logger.log(
        `Order already exists for auction ${auctionId}: ${auction.order.orderId}`,
      );
      return;
    }

    const order = await this.prisma.order.create({
      data: {
        orderCode: this.generateOrderCode(),
        auctionId: auction.auctionId,
        buyerId: auction.winnerId,
        totalAmount: auction.currentPrice,
        status: OrderStatus.PENDING,
      },
    });

    this.logger.log(
      `Order created successfully: ${order.orderId} for auction ${auctionId}`,
    );
  }

  async findById(
    orderId: string,
    userId: string,
  ): Promise<GetOrderByIdResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: {
        orderId,
        buyerId: userId,
      },
      include: {
        auction: {
          include: {
            auctionProducts: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);

      throw new NotFoundException(ERROR_ORDER_NOT_FOUND);
    }

    return {
      orderId: order.orderId,
      orderCode: order.orderCode,
      auctionId: order.auctionId,
      buyerId: order.buyerId,
      totalAmount: Number(order.totalAmount),
      status: order.status,

      products: order.auction.auctionProducts.map(({ product, quantity }) => ({
        productId: product.productId,
        name: product.name,
        quantity,
      })),

      payments: order.payments.map((payment) => ({
        paymentId: payment.paymentId,
        status: payment.status,
        amount: Number(payment.amount),
        transactionRef: payment.transactionRef,
        transactionNo: payment.transactionNo,
        responseCode: payment.responseCode,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async findMyOrders(userId: string): Promise<MyOrderResponseDto[]> {
    this.logger.log(`Fetching orders for user: ${userId}`);

    const orders = await this.prisma.order.findMany({
      where: {
        buyerId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        orderId: true,
        orderCode: true,
        auctionId: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        auction: {
          select: {
            title: true,
          },
        },
      },
    });

    this.logger.log(`Found ${orders.length} orders for user: ${userId}`);

    return orders.map((order) => ({
      orderId: order.orderId,
      orderCode: order.orderCode,
      auctionId: order.auctionId,
      auctionTitle: order.auction.title,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  private generateOrderCode(): string {
    return `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }
}
