import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_INTERNAL_SERVER } from '@common/constants/error.constant';
import { LoggerService } from '@common/services/logger.service';

@Catch()
export class AllExceptionFilter<T extends Error> implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  catch(exception: T, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const message = exception?.message ?? ERROR_INTERNAL_SERVER.message;
    const errorResponse = {
      ...ERROR_INTERNAL_SERVER,
      message,
    };

    this.logger.error(
      `Error: [${request.requestId}] ${request.method} ${request.url} - Message: ${message}`,
    );
    this.logger.logJson(
      'Exception',
      {
        requestId: request.requestId,
        ...errorResponse,
      },
      'error',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}
