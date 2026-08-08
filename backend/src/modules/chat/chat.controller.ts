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

@Controller('chat')
export class ChatController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Post('conversations/:recipientId')
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
