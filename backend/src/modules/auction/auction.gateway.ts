import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WS_ROOMS } from '@common/constants/websocket-room.constant';
import { LoggerService } from '@common/services/logger.service';
import { WebsocketAuthService } from '@common/services/websocket-auth.service';
import { AUCTION_EVENTS } from '@modules/auction/constants/websocket-event.constant';
import { UseFilters, UsePipes } from '@nestjs/common';
import { WsValidationPipe } from '@common/pipes/ws-validation.pipe';
import { WsExceptionFilter } from '@common/filters/ws-exception.filter';
import { UserService } from '@modules/user/user.service';
import { AuctionSubscriptionService } from '@modules/auction/services/auction-subscription.service';
import { AuctionStatus } from '@generated/prisma/enums';

interface SocketData {
  userId?: string;
  profileImageUrl?: string | null;
  joinedAuctionIds?: Set<string>;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/auctions',
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly websocketAuthService: WebsocketAuthService,
    private readonly auctionSubscriptionService: AuctionSubscriptionService,
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const data = client.data as SocketData;

    try {
      const payload = await this.websocketAuthService.authenticate(client);
      data.userId = payload.userId;
      data.profileImageUrl = await this.userService.getProfileImageUrl(
        payload.userId,
      );
      data.joinedAuctionIds = new Set();

      this.logger.log(
        `[AUCTION] Socket connected: userId=${payload.userId}, socketId=${client.id}`,
      );
    } catch {
      // Auction pages are public, so unauthenticated users
      // are allowed to establish a socket connection.
      data.userId = undefined;
      data.profileImageUrl = null;

      this.logger.log(
        `[AUCTION] Guest socket connected: socketId=${client.id}`,
      );
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const data = client.data as SocketData;

    // Remove all gallery subscriptions from Redis.
    await this.auctionSubscriptionService.removeAllSubscriptions(client.id);

    if (!data.userId) {
      this.logger.log(
        `[AUCTION] Guest socket disconnected: socketId=${client.id}`,
      );
      return;
    }

    const auctionRooms = [...client.rooms].filter((room) =>
      room.startsWith('auction:'),
    );

    for (const room of auctionRooms) {
      const sockets = await this.server.in(room).fetchSockets();

      const userStillPresent = sockets.some(
        (socket) => (socket.data as SocketData).userId === data.userId,
      );

      if (!userStillPresent) {
        client.to(room).emit(AUCTION_EVENTS.BIDDER_LEFT, {
          auctionId: room.replace('auction:', ''),
          userId: data.userId,
        });
      }
    }

    this.logger.log(
      `[AUCTION] Socket disconnected: userId=${data.userId}, socketId=${client.id}`,
    );
  }

  @SubscribeMessage(AUCTION_EVENTS.AUCTION_JOIN)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionId: string },
  ): Promise<void> {
    const { auctionId } = payload;
    const room = WS_ROOMS.AUCTION(auctionId);
    const data = client.data as SocketData;

    await client.join(room);

    // Guests can join the room to receive auction realtime events,
    // but they are not tracked as bidders.
    if (!data.userId) {
      this.logger.log(`[AUCTION] Guest joined auction ${auctionId}`);
      return;
    }

    const sockets = await this.server.in(room).fetchSockets();

    // Build a unique list of authenticated bidders.
    const bidders = [
      ...new Map(
        sockets
          .map((socket) => socket.data as SocketData)
          .filter((socketData) => socketData.userId)
          .map((socketData) => [
            socketData.userId!,
            {
              userId: socketData.userId!,
              profileImageUrl: socketData.profileImageUrl ?? null,
            },
          ]),
      ).values(),
    ];

    // Send the current bidder list only to the joining client.
    client.emit(AUCTION_EVENTS.BIDDER_SNAPSHOT, {
      auctionId,
      bidders,
    });

    // Notify other clients about the new bidder.
    client.to(room).emit(AUCTION_EVENTS.BIDDER_JOINED, {
      auctionId,
      bidder: {
        userId: data.userId,
        profileImageUrl: data.profileImageUrl ?? null,
      },
    });

    this.logger.log(
      `[AUCTION] User ${data.userId} joined auction ${auctionId}`,
    );
  }

  @SubscribeMessage(AUCTION_EVENTS.AUCTION_LEAVE)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionId: string },
  ): Promise<void> {
    const { auctionId } = payload;
    const room = WS_ROOMS.AUCTION(auctionId);
    const data = client.data as SocketData;

    await client.leave(room);

    // Guests are not tracked as bidders.
    if (!data.userId) {
      this.logger.log(`[AUCTION] Guest left auction ${auctionId}`);
      return;
    }

    const sockets = await this.server.in(room).fetchSockets();

    // Do not remove the user if they still have another
    // socket connected to the same auction.
    const userStillPresent = sockets.some(
      (socket) => (socket.data as SocketData).userId === data.userId,
    );

    if (!userStillPresent) {
      client.to(room).emit(AUCTION_EVENTS.BIDDER_LEFT, {
        auctionId,
        userId: data.userId,
      });
    }

    this.logger.log(`[AUCTION] User ${data.userId} left auction ${auctionId}`);
  }

  @SubscribeMessage(AUCTION_EVENTS.AUCTION_SUBSCRIBE)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleSubscribeAuctions(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionIds: string[] },
  ): Promise<void> {
    const { auctionIds } = payload;
    if (auctionIds.length === 0) {
      return;
    }

    await this.auctionSubscriptionService.subscribe(client.id, auctionIds);

    this.logger.log(
      `[AUCTION] Socket subscribed: socketId=${client.id}, auctionIds=${auctionIds.join(',')}`,
    );
  }

  @SubscribeMessage(AUCTION_EVENTS.AUCTION_UNSUBSCRIBE)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleUnsubscribeAuctions(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionIds: string[] },
  ): Promise<void> {
    const { auctionIds } = payload;

    if (auctionIds.length === 0) {
      return;
    }

    await this.auctionSubscriptionService.unsubscribe(client.id, auctionIds);

    this.logger.log(
      `[AUCTION] Socket unsubscribed: socketId=${client.id}, auctionIds=${auctionIds.join(',')}`,
    );
  }

  emitAuctionStarted(data: {
    auctionId: string;
    startTime: Date;
    endTime: Date;
  }): void {
    this.server
      .to(WS_ROOMS.AUCTION(data.auctionId))
      .emit(AUCTION_EVENTS.AUCTION_STARTED, {
        auctionId: data.auctionId,
        startTime: data.startTime,
        endTime: data.endTime,
      });
  }

  emitAuctionExtended(data: { auctionId: string; endTime: Date }): void {
    this.server
      .to(WS_ROOMS.AUCTION(data.auctionId))
      .emit(AUCTION_EVENTS.AUCTION_EXTENDED, {
        auctionId: data.auctionId,
        endTime: data.endTime,
      });
  }

  emitAuctionCompleted(auctionId: string): void {
    this.server
      .to(WS_ROOMS.AUCTION(auctionId))
      .emit(AUCTION_EVENTS.AUCTION_COMPLETED, {
        auctionId,
      });
  }

  emitAuctionClosed(auctionId: string): void {
    this.server
      .to(WS_ROOMS.AUCTION(auctionId))
      .emit(AUCTION_EVENTS.AUCTION_CLOSED, {
        auctionId,
      });
  }

  emitAuctionWinner(data: {
    auctionId: string;
    winnerId: string;
    username: string;
    bidAmount: number;
    profileImageUrl: string | null;
  }): void {
    this.server
      .to(WS_ROOMS.AUCTION(data.auctionId))
      .emit(AUCTION_EVENTS.AUCTION_WINNER, {
        auctionId: data.auctionId,
        winnerId: data.winnerId,
        username: data.username,
        bidAmount: data.bidAmount,
        profileImageUrl: data.profileImageUrl,
      });
  }

  emitAuctionReopened(data: {
    auctionId: string;
    startTime: Date;
    endTime: Date;
  }): void {
    this.server
      .to(WS_ROOMS.AUCTION(data.auctionId))
      .emit(AUCTION_EVENTS.AUCTION_REOPENED, {
        auctionId: data.auctionId,
        startTime: data.startTime,
        endTime: data.endTime,
      });
  }

  async emitAuctionUpdated(data: {
    auctionId: string;
    currentPrice?: number;
    bidCount?: number;
    status?: AuctionStatus;
    endTime?: Date;
  }): Promise<void> {
    const socketIds = await this.auctionSubscriptionService.getSubscribers(
      data.auctionId,
    );

    if (socketIds.length === 0) {
      return;
    }

    this.server.to(socketIds).emit(AUCTION_EVENTS.AUCTION_UPDATED, {
      auctionId: data.auctionId,
      currentPrice: data.currentPrice,
      bidCount: data.bidCount,
      status: data.status,
      endTime: data.endTime,
    });
  }
}
