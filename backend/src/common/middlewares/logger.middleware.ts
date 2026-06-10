import { Injectable, NestMiddleware } from '@nestjs/common';
import { LoggerService } from '@common/services/logger.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger: LoggerService = new LoggerService(
    LoggerMiddleware.name,
  );

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, requestId } = req;
    this.logger.log(
      `Incoming Request: [${requestId}] ${method} ${originalUrl} - IP: ${ip}`,
    );

    res.on('finish', () => {
      this.logger.log(
        `Response: [${requestId}] ${method} ${originalUrl} - Status: ${res.statusCode}`,
      );
    });

    next();
  }
}
