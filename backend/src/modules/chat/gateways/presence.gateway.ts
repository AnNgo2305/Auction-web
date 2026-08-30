import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PresenceService } from '@modules/chat/services/presence.service';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WsExceptionFilter } from '@common/filters/ws-exception.filter';
import { PRESENCE_EVENTS } from '@modules/chat/constants/websocket-event.constant';
import { WsJwtGuard } from '@common/guards/ws-jwt.guard';
import { Server, Socket } from 'socket.io';
import { WebsocketAuthService } from '@common/services/websocket-auth.service';
import { WS_ROOMS } from '@common/constants/websocket-room.constant';
import { WsValidationPipe } from '@common/pipes/ws-validation.pipe';
import { PresenceSubscriptionDto } from '@modules/chat/dtos/presence/presence-subscription.body.dto';

interface SocketData {
  userId: string;
}

@WebSocketGateway({
  namespace: '/presence',
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly websocketAuthService: WebsocketAuthService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = await this.websocketAuthService.authenticate(client);

      const data = client.data as SocketData;
      data.userId = payload.userId;

      await client.join(WS_ROOMS.USER(payload.userId));

      const { becameOnline } = await this.presenceService.markOnline(
        data.userId,
        client.id,
      );

      if (becameOnline) {
        await this.broadcastOnlineToWatchers(data.userId);
      }
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const data = client.data as SocketData;

    if (!data.userId) {
      return;
    }

    const { isOffline } = await this.presenceService.markOffline(
      data.userId,
      client.id,
    );

    if (isOffline) {
      await this.broadcastOfflineToWatchers(data.userId);
      await this.presenceService.removeWatching(data.userId);
    }
  }

  @SubscribeMessage(PRESENCE_EVENTS.HEARTBEAT)
  @UseGuards(WsJwtGuard)
  @UseFilters(WsExceptionFilter)
  async handleHeartbeat(@ConnectedSocket() client: Socket): Promise<void> {
    const data = client.data as SocketData;
    if (!data.userId) return;
    await this.presenceService.refreshHeartbeat(data.userId, client.id);
    client.emit(PRESENCE_EVENTS.HEARTBEAT_ACK);
  }

  @SubscribeMessage(PRESENCE_EVENTS.PRESENCE_SUBSCRIBE)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handlePresenceSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PresenceSubscriptionDto,
  ): Promise<void> {
    const data = client.data as SocketData;

    await this.presenceService.subscribe(data.userId, payload.userIds);

    const snapshot = await this.presenceService.getPresenceSnapshot(
      payload.userIds,
    );
    client.emit(PRESENCE_EVENTS.PRESENCE_SNAPSHOT, {
      onlineMap: Object.fromEntries(snapshot.onlineMap),
      lastSeenMap: Object.fromEntries(snapshot.lastSeenMap),
    });
  }

  @SubscribeMessage(PRESENCE_EVENTS.PRESENCE_UNSUBSCRIBE)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handlePresenceUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PresenceSubscriptionDto,
  ): Promise<void> {
    const data = client.data as SocketData;

    await this.presenceService.unsubscribe(data.userId, payload.userIds);
  }

  async broadcastOnlineToWatchers(userId: string): Promise<void> {
    const watcherIds = await this.presenceService.getWatchers(userId);

    if (watcherIds.length === 0) {
      return;
    }

    for (const watcherId of watcherIds) {
      this.server
        .to(WS_ROOMS.USER(watcherId))
        .emit(PRESENCE_EVENTS.PRESENCE_ONLINE, {
          userId,
        });
    }
  }

  async broadcastOfflineToWatchers(userId: string): Promise<void> {
    const watcherIds = await this.presenceService.getWatchers(userId);

    if (watcherIds.length === 0) {
      return;
    }

    const lastSeen = await this.presenceService.getLastSeen(userId);

    for (const watcherId of watcherIds) {
      this.server
        .to(WS_ROOMS.USER(watcherId))
        .emit(PRESENCE_EVENTS.PRESENCE_OFFLINE, {
          userId,
          lastSeen,
        });
    }
  }

  async getLiveSocketsByUser(): Promise<Map<string, string[]>> {
    const sockets = await this.server.fetchSockets();
    const result = new Map<string, string[]>();
    for (const socket of sockets) {
      const data = socket.data as SocketData;
      const userId = data?.userId;
      if (!userId) continue;

      const socketIds = result.get(userId) ?? [];
      socketIds.push(socket.id);
      result.set(userId, socketIds);
    }

    return result;
  }
}
