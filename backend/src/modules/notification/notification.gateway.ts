import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { LoggerService } from '@common/services/logger.service';
import { WebsocketAuthService } from '@common/services/websocket-auth.service';
import { WS_ROOMS } from '@common/constants/websocket-room.constant';
import { NOTIFICATION_EVENTS } from '@modules/notification/constants/websocket-event.constant';
import { NotificationDto } from '@modules/notification/dtos/notification.dto';
import { Server, Socket } from 'socket.io';

interface SocketData {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
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

      await client.join(WS_ROOMS.USER(payload.userId));

      this.logger.log(
        `[NOTIFICATION] Socket connected: userId=${payload.userId}, socketId=${client.id}`,
      );
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const data = client.data as SocketData;

    if (!data.userId) {
      this.logger.log(
        `[NOTIFICATION] Socket disconnected before authentication: socketId=${client.id}`,
      );
      return;
    }

    this.logger.log(
      `[NOTIFICATION] Socket disconnected: userId=${data.userId}, socketId=${client.id}`,
    );
  }

  emitNotification(recipientId: string, notification: NotificationDto): void {
    this.server
      .to(WS_ROOMS.USER(recipientId))
      .emit(NOTIFICATION_EVENTS.NEW_NOTIFICATION, {
        notification,
      });
  }

  emitUnreadCount(recipientId: string, unreadCount: number): void {
    this.server
      .to(WS_ROOMS.USER(recipientId))
      .emit(NOTIFICATION_EVENTS.UNREAD_COUNT, {
        unreadCount,
      });
  }
}
