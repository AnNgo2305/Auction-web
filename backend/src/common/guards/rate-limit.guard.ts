import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ThrottlerLimitDetail } from '@nestjs/throttler/dist/throttler.guard.interface';
import { ERROR_TOO_MANY_REQUESTS } from '@common/constants/error.constant';
import { Role } from '@generated/prisma/enums';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorageService,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (req.user?.role === Role.ADMIN) {
      return true;
    }

    return super.shouldSkip(context);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: Request): Promise<string> {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'anonymous';

    const deviceId = req.headers['x-device-id'] as string;
    const rawUserAgent = req.headers['user-agent'] || 'unknown-agent';
    const userAgent = rawUserAgent.replace(/\s+/g, '').slice(0, 40);

    const userId = req.user?.userId;
    if (userId) {
      return deviceId
        ? `user:${userId}:device:${deviceId}`
        : `user:${userId}:ip:${clientIp}`;
    }

    if (deviceId) {
      return `guest:device:${deviceId}:ip:${clientIp}`;
    }

    return `guest:ip:${clientIp}:ua:${userAgent}`;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async throwThrottlingException(
    _context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const timeToWaitInSeconds = Math.ceil(
      throttlerLimitDetail.timeToBlockExpire / 1000,
    );

    throw new HttpException(
      {
        ...ERROR_TOO_MANY_REQUESTS,
        retryAfter: timeToWaitInSeconds,
      },
      ERROR_TOO_MANY_REQUESTS.statusCode,
    );
  }
}
