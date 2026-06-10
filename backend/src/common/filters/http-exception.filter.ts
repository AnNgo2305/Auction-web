import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '@common/services/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  constructor(private readonly logger: LoggerService) {}
  catch(exception: T, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse =
      typeof exceptionResponse === 'object'
        ? exceptionResponse
        : { message: exceptionResponse };

    const message =
      (errorResponse as Record<string, unknown>).message?.toString() ??
      exception.message;

    this.logger.error(
      `Error: [${request.requestId}] ${request.method} ${request.url} - Message: ${message}`,
    );
    this.logger.logJson(
      'Http Exception',
      {
        requestId: request.requestId,
        ...errorResponse,
      },
      'error',
    );

    response.status(status).json(errorResponse);
  }
}
