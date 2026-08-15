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
import { MessageService } from '@modules/chat/services/message.service';
import { ConversationService } from '@modules/chat/services/conversation.service';
import { WebsocketAuthService } from '@common/services/websocket-auth.service';
import { CHAT_EVENTS } from '@modules/chat/constants/websocket-event.constant';
import { WS_ROOMS } from '@common/constants/websocket-room.constant';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { WsJwtGuard } from '@common/guards/ws-jwt.guard';
import { WsValidationPipe } from '@common/pipes/ws-validation.pipe';
import { CreateMessageDto } from '@modules/chat/dtos/message/create-message.body.dto';
import { RateLimitService } from '@common/services/rate-limit.service';
import { LoggerService } from '@common/services/logger.service';
import { IDEMPOTENCY_STATUS } from '@common/constants/redis.constant';
import { MessageIdempotencyService } from '@modules/chat/services/message-idempotency.service';
import { WsExceptionFilter } from '@common/filters/ws-exception.filter';
import { TypingMessageBodyDto } from '@modules/chat/dtos/message/typing-message.body.dto';
import { ReadMessageDto } from '@modules/chat/dtos/message/read-message.body.dto';
import { UpdateMessageDto } from '@modules/chat/dtos/message/update-message.body.dto';
import { DeleteMessageDto } from '@modules/chat/dtos/message/delete-message.body.dto';
import { MessageSentEvent } from '@modules/chat/events/message-sent.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INTERNAL_EVENTS } from '@common/constants/event.constant';

interface SocketData {
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly websocketAuthService: WebsocketAuthService,
    private readonly rateLimitService: RateLimitService,
    private readonly messageIdempotencyService: MessageIdempotencyService,
    private readonly logger: LoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const payload = await this.websocketAuthService.authenticate(client);

      const data = client.data as SocketData;
      data.userId = payload.userId;

      const conversationIds =
        await this.conversationService.getUserConversationIds(payload.userId);

      await Promise.all(
        conversationIds.map((conversationId) =>
          client.join(WS_ROOMS.CONVERSATION(conversationId)),
        ),
      );
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const data = client.data as SocketData;
    if (!data.userId) {
      this.logger.log(
        `[CHAT] Socket disconnected before authentication: socketId=${client.id}`,
      );
      return;
    }
    this.logger.log(
      `[CHAT] Socket disconnected: userId=${data.userId}, socketId=${client.id}`,
    );
  }

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_SEND)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateMessageDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    const allowed = await this.rateLimitService.checkSendMessage(currentUserId);
    if (!allowed) {
      client.emit(CHAT_EVENTS.MESSAGE_ERROR, {
        tempId: payload.tempId,
        message: 'Too many messages. Please try again later.',
      });

      return;
    }

    let idempotencyAcquired = false;
    try {
      const idempotencyState = await this.messageIdempotencyService.getState(
        currentUserId,
        payload.tempId,
      );

      if (idempotencyState?.status === IDEMPOTENCY_STATUS.PROCESSING) {
        return;
      }

      if (
        idempotencyState?.status === IDEMPOTENCY_STATUS.COMPLETED &&
        idempotencyState.messageId
      ) {
        const message = await this.messageService.getMessageById(
          idempotencyState.messageId,
        );
        client.emit(CHAT_EVENTS.MESSAGE_ACK, {
          tempId: payload.tempId,
          message,
        });
        return;
      }

      const acquired = await this.messageIdempotencyService.start(
        currentUserId,
        payload.tempId,
      );
      if (!acquired) {
        const state = await this.messageIdempotencyService.getState(
          currentUserId,
          payload.tempId,
        );

        if (state?.status === IDEMPOTENCY_STATUS.COMPLETED && state.messageId) {
          const message = await this.messageService.getMessageById(
            state.messageId,
          );
          client.emit(CHAT_EVENTS.MESSAGE_ACK, {
            tempId: payload.tempId,
            message,
          });
        }
        return;
      }
      idempotencyAcquired = true;

      const message = await this.messageService.sendMessage(
        currentUserId,
        payload,
      );

      await this.messageIdempotencyService.complete(
        currentUserId,
        payload.tempId,
        message.messageId,
      );

      client.emit(CHAT_EVENTS.MESSAGE_ACK, {
        tempId: payload.tempId,
        message,
      });

      const conversationRoom = WS_ROOMS.CONVERSATION(payload.conversationId);
      const sockets = await this.server.in(conversationRoom).fetchSockets();

      const recipientId = message?.recipientId ?? '';
      const recipientInRoom = sockets.some(
        (socket) => (socket.data as SocketData).userId === recipientId,
      );

      if (recipientInRoom) {
        client
          .to(WS_ROOMS.CONVERSATION(payload.conversationId))
          .emit(CHAT_EVENTS.MESSAGE_NEW, {
            message,
          });

        this.server
          .to(WS_ROOMS.CONVERSATION(payload.conversationId))
          .emit(CHAT_EVENTS.CONVERSATION_UPDATED, {
            conversationId: payload.conversationId,
            lastMessage: {
              messageId: message.messageId,
              content: message.content,
              type: message.type,
              senderId: message.sender.userId,
              senderName: message.sender.username,
              createdAt: message.createdAt,
            },
            updatedAt: message.createdAt,
          });
      } else {
        this.eventEmitter.emit(
          INTERNAL_EVENTS.MESSAGE_SENT,
          new MessageSentEvent(
            message.messageId,
            message.conversationId,
            currentUserId,
            recipientId,
          ),
        );
      }
    } catch (error) {
      if (idempotencyAcquired) {
        await this.messageIdempotencyService.remove(
          currentUserId,
          payload.tempId,
        );
      }
      this.logger.error(
        `[CHAT] Failed to send message: ${payload.tempId}`,
        error,
      );
      client.emit(CHAT_EVENTS.MESSAGE_ERROR, {
        tempId: payload.tempId,
        message: 'Failed to send message. Please try again.',
      });
    }
  }

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_READ)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReadMessageDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    try {
      await this.messageService.readMessage(
        currentUserId,
        payload.conversationId,
        payload.messageId,
      );

      client
        .to(WS_ROOMS.CONVERSATION(payload.conversationId))
        .emit(CHAT_EVENTS.MESSAGE_READ, {
          conversationId: payload.conversationId,
          messageId: payload.messageId,
          readBy: currentUserId,
        });
    } catch (error) {
      this.logger.error(
        `[CHAT] Failed to read message: ${payload.messageId}`,
        error,
      );

      client.emit(CHAT_EVENTS.MESSAGE_ERROR, {
        messageId: payload.messageId,
        message: 'Failed to mark message as read.',
      });
    }
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_START)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingMessageBodyDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    const allowed = await this.rateLimitService.checkTyping(currentUserId);

    if (!allowed) {
      return;
    }

    client
      .to(WS_ROOMS.CONVERSATION(payload.conversationId))
      .emit(CHAT_EVENTS.TYPING_START, {
        conversationId: payload.conversationId,
        userId: currentUserId,
      });
  }

  @SubscribeMessage(CHAT_EVENTS.TYPING_STOP)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingMessageBodyDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    const allowed = await this.rateLimitService.checkTyping(currentUserId);
    if (!allowed) {
      return;
    }

    client
      .to(WS_ROOMS.CONVERSATION(payload.conversationId))
      .emit(CHAT_EVENTS.TYPING_STOP, {
        conversationId: payload.conversationId,
        userId: currentUserId,
      });
  }

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_UPDATE)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleUpdateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateMessageDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    try {
      const message = await this.messageService.updateMessage(
        currentUserId,
        payload.messageId,
        payload.content,
      );

      this.server
        .to(WS_ROOMS.CONVERSATION(payload.conversationId))
        .emit(CHAT_EVENTS.MESSAGE_UPDATED, {
          message,
        });
    } catch (error) {
      this.logger.error(
        `[CHAT] Failed to update message: ${payload.messageId}`,
        error,
      );

      client.emit(CHAT_EVENTS.MESSAGE_ERROR, {
        messageId: payload.messageId,
        message: 'Failed to update message.',
      });
    }
  }

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_DELETE)
  @UseGuards(WsJwtGuard)
  @UsePipes(WsValidationPipe)
  @UseFilters(WsExceptionFilter)
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DeleteMessageDto,
  ): Promise<void> {
    const data = client.data as SocketData;
    const currentUserId = data.userId;

    try {
      await this.messageService.deleteMessage(currentUserId, payload.messageId);

      this.server
        .to(WS_ROOMS.CONVERSATION(payload.conversationId))
        .emit(CHAT_EVENTS.MESSAGE_DELETED, {
          conversationId: payload.conversationId,
          messageId: payload.messageId,
        });
    } catch (error) {
      this.logger.error(
        `[CHAT] Failed to delete message: ${payload.messageId}`,
        error,
      );

      client.emit(CHAT_EVENTS.MESSAGE_ERROR, {
        messageId: payload.messageId,
        message: 'Failed to delete message.',
      });
    }
  }
}
