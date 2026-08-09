import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatController } from '@modules/chat/chat.controller';
import { ConversationService } from '@modules/chat/services/conversation.service';
import { MessageService } from '@modules/chat/services/message.service';
import { MessageIdempotencyService } from '@modules/chat/services/message-idempotency.service';
import { PresenceService } from '@modules/chat/services/presence.service';
import { ChatGateway } from '@modules/chat/gateways/chat.gateway';
import { PresenceGateway } from '@modules/chat/gateways/presence.gateway';
import { PresenceScheduler } from '@modules/chat/schedulers/presence.scheduler';

@Module({
  imports: [EventEmitterModule],
  controllers: [ChatController],
  providers: [
    ConversationService,
    MessageService,
    MessageIdempotencyService,
    PresenceService,
    ChatGateway,
    PresenceGateway,
    PresenceScheduler,
  ],
  exports: [ConversationService, MessageService, PresenceService],
})
export class ChatModule {}
