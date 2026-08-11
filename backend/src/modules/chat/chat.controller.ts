import { ConversationService } from '@modules/chat/services/conversation.service';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { MessageService } from '@modules/chat/services/message.service';
import { Request } from 'express';
import { ResponsePayload } from '@common/types/response.interface';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Throttle } from '@nestjs/throttler';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Post('conversations/:recipientId')
  @Throttle({
    short: { ttl: 1_000, limit: 3 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 30 },
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrGetConversation(
    @Req() req: Request,
    @Param('recipientId') recipientId: string,
  ): Promise<ResponsePayload> {
    const conversation = await this.conversationService.createOrGetConversation(
      req.user!.userId,
      recipientId,
    );
    return {
      message: 'Conversation retrieved successfully',
      data: conversation,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Delete('conversations/:conversationId')
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  async deleteConversation(
    @Req() req: Request,
    @Param('conversationId') conversationId: string,
  ): Promise<ResponsePayload> {
    await this.conversationService.deleteConversation(
      req.user!.userId,
      conversationId,
    );

    return {
      message: 'Conversation deleted successfully',
      data: {},
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Get('conversations')
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  async getUserConversations(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const conversations = await this.conversationService.getUserConversations(
      req.user!.userId,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Conversations retrieved successfully',
      data: conversations,
    };
  }

  @Get('conversations/:conversationId/messages')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 15 },
    medium: { ttl: 10_000, limit: 75 },
    long: { ttl: 60_000, limit: 300 },
  })
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Req() req: Request,
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ResponsePayload> {
    const messages = await this.messageService.getMessages(
      req.user!.userId,
      conversationId,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Messages retrieved successfully',
      data: messages,
    };
  }
}
