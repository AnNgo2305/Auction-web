import { Module } from '@nestjs/common';
import { ChatController } from '@modules/chat/chat.controller';
import { ConversationService } from '@modules/chat/services/conversation.service';
import { MessageService } from '@modules/chat/services/message.service';
import { MessageIdempotencyService } from '@modules/chat/services/message-idempotency.service';
import { ChatGateway } from '@modules/chat/gateways/chat.gateway';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ChatController],
  providers: [
    ConversationService,
    MessageService,
    MessageIdempotencyService,
    ChatGateway,
  ],
  exports: [ConversationService, MessageService],
})
export class ChatModule {}
