import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();

    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      statusCode = exception.getStatus();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const data = response as Record<string, unknown>;

        errorCode =
          typeof data.errorCode === 'string' ? data.errorCode : 'UNKNOWN_ERROR';

        message = typeof data.message === 'string' ? data.message : message;
      }
    }

    client.emit('exception', {
      statusCode,
      errorCode,
      message,
    });
  }
}
