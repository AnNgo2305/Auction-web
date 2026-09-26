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

interface SocketData {
  userId: string;
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
    private readonly logger: LoggerService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = await this.websocketAuthService.authenticate(client);

      const data = client.data as SocketData;
      data.userId = payload.userId;

      this.logger.log(
        `[AUCTION] Socket connected: userId=${payload.userId}, socketId=${client.id}`,
      );
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const data = client.data as SocketData;

    if (!data.userId) {
      this.logger.log(
        `[AUCTION] Socket disconnected before authentication: socketId=${client.id}`,
      );
      return;
    }

    this.logger.log(
      `[AUCTION] Socket disconnected: userId=${data.userId}, socketId=${client.id}`,
    );
  }

  @SubscribeMessage(AUCTION_EVENTS.AUCTION_JOIN)
  async handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() auctionId: string,
  ): Promise<void> {
    await client.join(WS_ROOMS.AUCTION(auctionId));

    const data = client.data as SocketData;
    const currentUserId = data.userId;

    this.logger.log(
      `[AUCTION] User ${currentUserId} joined auction ${auctionId}`,
    );
  }

  @SubscribeMessage(AUCTION_EVENTS.AUCTION_LEAVE)
  async handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() auctionId: string,
  ): Promise<void> {
    await client.leave(WS_ROOMS.AUCTION(auctionId));

    const data = client.data as SocketData;
    const currentUserId = data.userId;

    this.logger.log(
      `[AUCTION] User ${currentUserId} left auction ${auctionId}`,
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
    winningBid: number;
    profileImageUrl: string | null;
  }): void {
    this.server
      .to(WS_ROOMS.AUCTION(data.auctionId))
      .emit(AUCTION_EVENTS.AUCTION_WINNER, {
        auctionId: data.auctionId,
        winnerId: data.winnerId,
        username: data.username,
        winningBid: data.winningBid,
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
}
