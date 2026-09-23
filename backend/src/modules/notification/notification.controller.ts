import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { ResponsePayload } from '@common/types/response.interface';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Throttle } from '@nestjs/throttler';
import {
  ApiCookieAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { GetNotificationsResponseDto } from '@modules/notification/dtos/get-notifications.response.dto';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import { NotificationDto } from '@modules/notification/dtos/notification.dto';

@ApiTags('Notifications')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  GetNotificationsResponseDto,
  NotificationDto,
)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 200 },
  })
  @Get()
  @ApiOperation({
    summary: 'Get notifications',
    description:
      'Retrieves the current user notifications using cursor-based pagination.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100,
    example: 10,
    description: 'Number of notifications to return',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Cursor used to retrieve the next page of notifications',
  })
  @ApiOkResponse({
    description: 'Notifications retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(GetNotificationsResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Get notifications successfully',
      data: {
        notifications: [
          {
            notificationId: '550e8400-e29b-41d4-a716-446655440000',
            recipientId: '660e8400-e29b-41d4-a716-446655440000',
            actorId: '770e8400-e29b-41d4-a716-446655440000',
            actorCount: 1,
            type: 'PRODUCT_COMMENT',
            entityId: '880e8400-e29b-41d4-a716-446655440000',
            entityType: 'PRODUCT',
            metadata: {},
            isRead: false,
            createdAt: '2026-09-22T05:30:00.000Z',
            readAt: null,
          },
        ],
        nextCursor: '990e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  @ApiCookieAuth('access_token')
  async getNotifications(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const notifications = await this.notificationService.getNotifications(
      currentUserId!,
      cursor,
      limit ? Number(limit) : 10,
    );

    return {
      message: 'Get notifications successfully',
      data: notifications,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  @Get('unread')
  @Throttle({
    short: { ttl: 1_000, limit: 20 },
    medium: { ttl: 10_000, limit: 100 },
    long: { ttl: 60_000, limit: 300 },
  })
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Retrieves the number of unread notifications for the current user.',
  })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    description: 'Unread notification count retrieved successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Get unread notification count successfully',
      data: { unreadCount: 5 },
    },
  })
  async getUnreadCount(@Req() req: Request): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const unreadCount = await this.notificationService.getUnreadCount(
      currentUserId!,
    );

    return {
      message: 'Get unread notification count successfully',
      data: {
        unreadCount,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 10 },
    medium: { ttl: 10_000, limit: 50 },
    long: { ttl: 60_000, limit: 150 },
  })
  @Patch(':notificationId/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a notification as read for the current user.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiParam({
    name: 'notificationId',
    type: String,
    format: 'uuid',
    description: 'Notification ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Notification marked as read successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { nullable: true, $ref: getSchemaPath(NotificationDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Read notification done',
      data: {
        notificationId: '550e8400-e29b-41d4-a716-446655440000',
        recipientId: '660e8400-e29b-41d4-a716-446655440000',
        actorId: '770e8400-e29b-41d4-a716-446655440000',
        actorCount: 1,
        type: 'PRODUCT_COMMENT',
        entityId: '880e8400-e29b-41d4-a716-446655440000',
        entityType: 'PRODUCT',
        metadata: {},
        isRead: true,
        createdAt: '2026-09-22T05:30:00.000Z',
        readAt: '2026-09-22T06:00:00.000Z',
      },
    },
  })
  async markAsRead(
    @Req() req: Request,
    @Param('notificationId') notificationId: string,
  ): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const notification = await this.notificationService.markAsRead(
      currentUserId!,
      notificationId,
    );

    return {
      message: 'Read notification done',
      data: notification,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  @Patch('read-all')
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 20 },
  })
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all unread notifications of the current user as read.',
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  @ApiOkResponse({
    description: 'All notifications marked as read successfully',
    type: SuccessResponse,
    example: {
      statusCode: 200,
      message: 'Mark all notifications as read successfully',
      data: { count: 5 },
    },
  })
  async markAllAsRead(@Req() req: Request): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const unreadCount = await this.notificationService.markAllAsRead(
      currentUserId!,
    );

    return {
      message: 'Mark all notifications as read successfully',
      data: {
        count: unreadCount,
      },
    };
  }
}
