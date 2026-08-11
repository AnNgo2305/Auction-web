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
  @Get('unread-count')
  @Throttle({
    short: { ttl: 1_000, limit: 20 },
    medium: { ttl: 10_000, limit: 100 },
    long: { ttl: 60_000, limit: 300 },
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
  async markAsRead(
    @Req() req: Request,
    @Param('notificationId') notificationId: string,
  ): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    await this.notificationService.markAsRead(currentUserId!, notificationId);

    return {
      message: 'Read notification done',
      data: {},
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
  async markAllAsRead(@Req() req: Request): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    await this.notificationService.markAllAsRead(currentUserId!);

    return {
      message: 'Mark all notifications as read successfully',
      data: {},
    };
  }
}
