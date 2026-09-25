import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebsocketAuthService } from '@common/services/websocket-auth.service';
import { LoggerService } from '@common/services/logger.service';
import { WsJwtGuard } from '@common/guards/ws-jwt.guard';
import { WsValidationPipe } from '@common/pipes/ws-validation.pipe';
import { WsExceptionFilter } from '@common/filters/ws-exception.filter';
import { BID_EVENTS } from '@modules/bid/constants/websocket-event.constant';
import { WS_ROOMS } from '@common/constants/websocket-room.constant';
import { JoinAuctionRoomDto } from '@modules/bid/dtos/join-auction-room.body.dto';
import { CreateBidDto } from '@modules/bid/dtos/create-bid.body.dto';
import { BidService } from '@modules/bid/services/bid.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';
import { BidPlacedEvent } from '@modules/bid/events/bid-placed.event';
import { IDEMPOTENCY_STATUS } from '@common/constants/redis.constant';
import { BidIdempotencyService } from '@modules/bid/services/bid-idempotency.service';
import { RateLimitService } from '@common/services/rate-limit.service';

interface SocketData {
  userId: string;
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/bid',
})
export class BidGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly bidService: BidService,
    private readonly websocketAuthService: WebsocketAuthService,
    private readonly rateLimitService: RateLimitService,
    private readonly bidIdempotencyService: BidIdempotencyService,
    private readonly logger: LoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = await this.websocketAuthService.authenticate(client);

      const data = client.data as SocketData;
      data.userId = payload.userId;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const data = client.data as SocketData;

    if (!data.userId) {
      this.logger.log(
        `[BID] Socket disconnected before authentication: socketId=${client.id}`,
      );
      return;
    }

    this.logger.log(
      `[BID] Socket disconnected: userId=${data.userId}, socketId=${client.id}`,
    );
  }

  @SubscribeMessage(BID_EVENTS.AUCTION_JOIN)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinAuctionRoomDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const room = WS_ROOMS.AUCTION(payload.auctionId);

    await client.join(room);

    client.to(room).emit(BID_EVENTS.AUCTION_USER_JOINED, {
      auctionId: payload.auctionId,
      userId: data.userId,
      username: data.username,
    });

    this.logger.debug(
      `[BID] User ${data.userId} joined auction room: auctionId=${payload.auctionId}`,
    );
  }

  @SubscribeMessage(BID_EVENTS.AUCTION_LEAVE)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinAuctionRoomDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const room = WS_ROOMS.AUCTION(payload.auctionId);

    await client.leave(room);

    client.to(room).emit(BID_EVENTS.AUCTION_USER_LEFT, {
      auctionId: payload.auctionId,
      userId: data.userId,
      username: data.username,
    });

    this.logger.debug(
      `[BID] User ${data.userId} left auction room: auctionId=${payload.auctionId}`,
    );
  }

  @SubscribeMessage(BID_EVENTS.BID_PLACE)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateBidDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    // Rate-limit bid requests to prevent spam or abuse.
    const allowed = await this.rateLimitService.checkPlaceBid(currentUserId);

    if (!allowed) {
      client.emit(BID_EVENTS.BID_ERROR, {
        auctionId: payload.auctionId,
        tempId: payload.tempId,
        bidAmount: payload.bidAmount,
        message: 'Too many bid requests. Please try again later.',
      });

      return;
    }

    // Track whether this request successfully acquired the idempotency key.
    // Only the request that acquired the key can remove it on failure.
    let idempotencyAcquired = false;

    try {
      // Check whether this tempId has already been processed.
      // The same tempId represents the same bid operation.
      const idempotencyState = await this.bidIdempotencyService.getState(
        currentUserId,
        payload.auctionId,
        payload.tempId,
      );

      switch (idempotencyState?.status) {
        // Another request with the same tempId is currently processing.
        // Ignore the duplicate request.
        case IDEMPOTENCY_STATUS.PROCESSING:
          return;

        // The bid was already created successfully.
        // Return the existing result instead of creating another bid.
        case IDEMPOTENCY_STATUS.COMPLETED: {
          if (!idempotencyState.bidId) {
            return;
          }

          const bid = await this.bidService.getBidById(idempotencyState.bidId);

          // Re-send ACK so the client can finish its pending operation.
          client.emit(BID_EVENTS.BID_ACK, {
            auctionId: bid.auctionId,
            tempId: payload.tempId,
            bidAmount: bid.bidAmount,
          });

          return;
        }
      }

      // Atomically acquire the idempotency key using Redis SET NX.
      // Only one concurrent request with the same tempId can become the owner.
      const acquired = await this.bidIdempotencyService.start(
        currentUserId,
        payload.auctionId,
        payload.tempId,
      );

      if (!acquired) {
        // Another request acquired the key between getState() and start().
        // Check the state again to see whether that request has already completed.
        const state = await this.bidIdempotencyService.getState(
          currentUserId,
          payload.auctionId,
          payload.tempId,
        );

        if (state?.status === IDEMPOTENCY_STATUS.COMPLETED && state.bidId) {
          const bid = await this.bidService.getBidById(state.bidId);

          // The original request completed successfully, so ACK the existing bid.
          client.emit(BID_EVENTS.BID_ACK, {
            auctionId: bid.auctionId,
            tempId: payload.tempId,
            bidAmount: bid.bidAmount,
          });
        }

        return;
      }

      // This request is now the owner of the idempotency key.
      idempotencyAcquired = true;

      // Only the request that owns the idempotency key can create the bid.
      const bid = await this.bidService.placeBid(
        currentUserId,
        payload.auctionId,
        payload.bidAmount,
      );

      // Store the created bid ID so future duplicate requests
      // can return the existing bid instead of creating another one.
      await this.bidIdempotencyService.complete(
        currentUserId,
        payload.auctionId,
        payload.tempId,
        bid.bidId,
      );

      // Acknowledge the bid to the bidder.
      client.emit(BID_EVENTS.BID_ACK, {
        auctionId: bid.auctionId,
        tempId: payload.tempId,
        bidAmount: bid.bidAmount,
      });

      // Notify other users currently watching this auction.
      client.to(WS_ROOMS.AUCTION(payload.auctionId)).emit(BID_EVENTS.BID_NEW, {
        auctionId: bid.auctionId,
        userId: currentUserId,
        username: data.username,
        bidAmount: bid.bidAmount,
      });

      // Trigger notification processing for users who watch this auction.
      this.eventEmitter.emit(
        INTERNAL_EVENTS.BID_PLACED,
        new BidPlacedEvent(
          bid.auctionId,
          currentUserId,
          data.username,
          bid.bidAmount,
          bid.auctionTitle,
        ),
      );
    } catch (error) {
      // Only remove the key if this request actually acquired it.
      // This allows the client to retry after a failed bid creation.
      if (idempotencyAcquired) {
        await this.bidIdempotencyService.remove(
          currentUserId,
          payload.auctionId,
          payload.tempId,
        );
      }

      this.logger.error(
        `[BID] Failed to place bid: auctionId=${payload.auctionId}, userId=${currentUserId}, tempId=${payload.tempId}`,
        error,
      );

      client.emit(BID_EVENTS.BID_ERROR, {
        auctionId: payload.auctionId,
        tempId: payload.tempId,
        bidAmount: payload.bidAmount,
        message: 'Failed to place bid. Please try again.',
      });
    }
  }
}
