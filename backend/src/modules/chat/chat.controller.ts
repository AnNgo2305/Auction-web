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
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ERROR_CANNOT_CREATE_CONVERSATION_WITH_SELF,
  ERROR_CONVERSATION_CREATION_TIMEOUT,
  ERROR_CONVERSATION_NOT_FOUND,
  ERROR_RECIPIENT_NOT_FOUND,
} from '@modules/chat/constants/conversation.constant';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { ConversationResponseDto } from '@modules/chat/dtos/conversation/get-create-conversation.response.dto';
import { SearchConversationsResponseDto } from '@modules/chat/dtos/conversation/search-conversations.response.dto';
import { GetConversationsResponseDto } from '@modules/chat/dtos/conversation/get-user-conversations.response.dto';
import { GetMessagesResponseDto } from '@modules/chat/dtos/message/get-messages.response.dto';
import {
  MessageResponseDto,
  MessageUserResponseDto,
  ReplyMessageResponseDto,
} from '@modules/chat/dtos/message/message.response.dto';

@ApiTags('Chat')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  ConversationResponseDto,
  GetConversationsResponseDto,
  SearchConversationsResponseDto,
  GetMessagesResponseDto,
  MessageResponseDto,
  MessageUserResponseDto,
  ReplyMessageResponseDto,
)
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
  @ApiOperation({
    summary: 'Create or get a conversation',
    description:
      'Creates a conversation with a recipient or returns the existing conversation.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'recipientId',
    type: String,
    format: 'uuid',
    description: 'User ID of the conversation recipient',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiCreatedResponse({
    description: 'Conversation retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(ConversationResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 201,
      message: 'Conversation retrieved successfully',
      data: {
        conversationId: '550e8400-e29b-41d4-a716-446655440001',
        initiator: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'john_doe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
        recipient: {
          userId: '550e8400-e29b-41d4-a716-446655440002',
          username: 'jane_doe',
          profileImageUrl: null,
        },
        lastMessage: {
          messageId: '550e8400-e29b-41d4-a716-446655440003',
          content: 'Hello, how are you?',
          type: 'TEXT',
          senderId: '550e8400-e29b-41d4-a716-446655440000',
          createdAt: '2026-09-23T08:00:00.000Z',
        },
        isDeleted: false,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_RECIPIENT_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_RECIPIENT_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: 'Conversation cannot be created',
    type: ErrorResponse,
    examples: {
      cannotCreateWithSelf: {
        summary: 'Cannot create conversation with yourself',
        value: ERROR_CANNOT_CREATE_CONVERSATION_WITH_SELF,
      },
      creationTimeout: {
        summary: 'Conversation creation timed out',
        value: ERROR_CONVERSATION_CREATION_TIMEOUT,
      },
    },
  })
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
  @Get('conversations/search')
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search conversations',
    description: 'Searches the current user conversations by username.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    example: 'john',
    description: 'Username search query',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Conversation ID used as the pagination cursor',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of conversations to return',
  })
  @ApiOkResponse({
    description: 'Conversations searched successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(SearchConversationsResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Conversations searched successfully',
      data: {
        conversations: [
          {
            conversationId: '550e8400-e29b-41d4-a716-446655440001',
            userId: '550e8400-e29b-41d4-a716-446655440002',
            username: 'jane_doe',
            profileImageUrl: 'https://example.com/profile.jpg',
          },
        ],
        nextCursor: null,
      },
    },
  })
  async searchConversations(
    @Req() req: Request,
    @Query('query') query: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<ResponsePayload> {
    const conversations = await this.conversationService.searchConversations({
      currentUserId: req.user!.userId,
      query,
      cursor,
      limit: limit ? Number(limit) : 10,
    });

    return {
      message: 'Conversations searched successfully',
      data: conversations,
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
  @ApiOperation({
    summary: 'Delete a conversation',
    description: 'Deletes a conversation for the current user.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'conversationId',
    type: String,
    format: 'uuid',
    description: 'Conversation ID to delete',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiOkResponse({
    description: 'Conversation deleted successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Conversation deleted successfully',
      data: {},
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_CONVERSATION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CONVERSATION_NOT_FOUND,
  })
  @ApiConflictResponse({
    description: ERROR_CONVERSATION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CONVERSATION_NOT_FOUND,
  })
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
  @ApiOperation({
    summary: 'Get user conversations',
    description: 'Retrieves the current user conversations with pagination.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of conversations to return',
  })
  @ApiQuery({
    name: 'lastMessageAt',
    required: false,
    type: String,
    format: 'date-time',
    example: '2026-09-23T08:00:00.000Z',
    description: 'Last message timestamp used as part of the pagination cursor',
  })
  @ApiQuery({
    name: 'conversationId',
    required: false,
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Conversation ID used as part of the pagination cursor',
  })
  @ApiOkResponse({
    description: 'Conversations retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(GetConversationsResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Conversations retrieved successfully',
      data: {
        conversations: [
          {
            conversationId: '550e8400-e29b-41d4-a716-446655440001',
            otherUser: {
              userId: '550e8400-e29b-41d4-a716-446655440002',
              username: 'jane_doe',
              profileImageUrl: 'https://example.com/profile.jpg',
            },
            lastMessage: {
              messageId: '550e8400-e29b-41d4-a716-446655440003',
              content: 'Hello, how are you?',
              type: 'TEXT',
              senderId: '550e8400-e29b-41d4-a716-446655440002',
              createdAt: '2026-09-23T08:00:00.000Z',
            },
            unreadCount: 2,
          },
        ],
        nextCursor: {
          lastMessageAt: '2026-09-23T08:00:00.000Z',
          conversationId: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  async getUserConversations(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('lastMessageAt') lastMessageAt?: string,
    @Query('conversationId') conversationId?: string,
  ): Promise<ResponsePayload> {
    const conversations = await this.conversationService.getUserConversations({
      currentUserId: req.user!.userId,
      lastMessageAt,
      conversationId,
      limit: limit ? Number(limit) : 10,
    });

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
  @ApiOperation({
    summary: 'Get conversation messages',
    description: 'Retrieves messages from a conversation with pagination.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'conversationId',
    type: String,
    format: 'uuid',
    description: 'Conversation ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Message ID used as the pagination cursor',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of messages to return',
  })
  @ApiOkResponse({
    description: 'Messages retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(GetMessagesResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Messages retrieved successfully',
      data: {
        messages: [
          {
            messageId: '550e8400-e29b-41d4-a716-446655440001',
            conversationId: '550e8400-e29b-41d4-a716-446655440002',
            sender: {
              userId: '550e8400-e29b-41d4-a716-446655440003',
              username: 'john_doe',
              profileImageUrl: 'https://example.com/profile.jpg',
            },
            recipientId: '550e8400-e29b-41d4-a716-446655440004',
            type: 'TEXT',
            content: 'Hello, how are you?',
            fileKey: null,
            fileName: null,
            mimeType: null,
            fileSize: null,
            readAt: '2026-09-23T08:05:00.000Z',
            isRead: true,
            createdAt: '2026-09-23T08:00:00.000Z',
            replyToMessage: null,
          },
        ],
        nextCursor: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_CONVERSATION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CONVERSATION_NOT_FOUND,
  })
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

  @Auth(AuthType.ACCESS_TOKEN)
  @Get('conversations/:conversationId')
  @Throttle({
    short: { ttl: 1_000, limit: 15 },
    medium: { ttl: 10_000, limit: 75 },
    long: { ttl: 60_000, limit: 300 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get conversation',
    description: 'Retrieves a conversation by its ID.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'conversationId',
    type: String,
    format: 'uuid',
    description: 'Conversation ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiOkResponse({
    description: 'Conversation retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(ConversationResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Conversation retrieved successfully',
      data: {
        conversationId: '550e8400-e29b-41d4-a716-446655440001',
        initiator: {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          username: 'john_doe',
          profileImageUrl: 'https://example.com/profile.jpg',
        },
        recipient: {
          userId: '550e8400-e29b-41d4-a716-446655440002',
          username: 'jane_doe',
          profileImageUrl: null,
        },
        lastMessage: null,
        isDeleted: false,
      },
    },
  })
  @ApiNotFoundResponse({
    description: ERROR_CONVERSATION_NOT_FOUND.message,
    type: ErrorResponse,
    example: ERROR_CONVERSATION_NOT_FOUND,
  })
  async getConversation(
    @Req() req: Request,
    @Param('conversationId') conversationId: string,
  ): Promise<ResponsePayload> {
    const conversation = await this.conversationService.getConversationById(
      req.user!.userId,
      conversationId,
    );

    return {
      message: 'Conversation retrieved successfully',
      data: conversation,
    };
  }
}
