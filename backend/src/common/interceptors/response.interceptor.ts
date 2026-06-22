import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { catchError, map, throwError } from 'rxjs';
import { LoggerService } from '@common/services/logger.service';
import type {
  Response,
  ResponsePayload,
} from '@common/types/response.interface';
import type { Request } from 'express';

export class ResponseInterceptor<T extends ResponsePayload>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger = new LoggerService(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    const request: Request = context.switchToHttp().getRequest();

    const now = Date.now();
    const { method, url } = request;
    this.logger.debug(`[${method}] ${url} - Request received`);

    return next.handle().pipe(
      map((res: T): Response<T> => {
        const formatted: Response<T> = this.handleSuccess(res, context);
        this.logger.debug(
          `[${method}] ${url} - Responded in ${Date.now() - now}ms`,
        );
        this.logger.logJson('Response', formatted, 'debug');
        return formatted;
      }),
      catchError((error: unknown) => {
        this.logger.error(`[${method}] ${url} - Error thrown`);
        return throwError(() => error);
      }),
    );
  }

  private handleSuccess(res: T, context: ExecutionContext): Response<T> {
    const response: Response<T> = context.switchToHttp().getResponse();

    return {
      statusCode: response.statusCode,
      message: res['message'] || '',
      data: res['data'] || '',
    };
  }
}
