import { NestFactory } from '@nestjs/core';
import type { OpenAPIObject } from '@nestjs/swagger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from '@common/services/logger.service';
import { CsrfService } from '@common/services/csrf.service';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ErrorResponse } from '@common/types/response.dto';
import {
  ERROR_CLASS_VALIDATION_FAILED,
  ERROR_INTERNAL_SERVER,
  ERROR_TOO_MANY_REQUESTS,
} from '@common/constants/error.constant';

const bootstrapLogger = new LoggerService('Bootstrap');

async function bootstrap(): Promise<{
  port: string | number;
  host: number | string;
}> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: new LoggerService('NestFactory'),
  });

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.use(cookieParser());
  const csrfService = app.get(CsrfService);
  app.use(csrfService.protection);

  const config = new DocumentBuilder()
    .setTitle('Auction API')
    .setDescription('Auction backend API')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-CSRF-Token',
        in: 'header',
      },
      'csrf-token',
    )
    .addGlobalResponse({
      status: 400,
      description: ERROR_CLASS_VALIDATION_FAILED.message,
      type: ErrorResponse,
      example: {
        statusCode: 400,
        errorCode: ERROR_CLASS_VALIDATION_FAILED.errorCode,
        message: ERROR_CLASS_VALIDATION_FAILED.message,
      },
    })
    .addGlobalResponse({
      status: 401,
      description: 'Authentication failed',
      type: ErrorResponse,
      example: {
        statusCode: 401,
        errorCode: 'AUTHENTICATION_FAILED',
        message: 'Authentication failed',
      },
    })
    .addGlobalResponse({
      status: 403,
      description: 'Forbidden',
      type: ErrorResponse,
      example: {
        statusCode: 403,
        errorCode: 'FORBIDDEN',
        message: 'Forbidden',
      },
    })
    .addGlobalResponse({
      status: 404,
      description: 'Resource not found',
      type: ErrorResponse,
      example: {
        statusCode: 404,
        errorCode: 'RESOURCE_NOT_FOUND',
        message: 'Resource not found',
      },
    })
    .addGlobalResponse({
      status: 429,
      description: ERROR_TOO_MANY_REQUESTS.message,
      type: ErrorResponse,
      example: {
        statusCode: 429,
        errorCode: ERROR_TOO_MANY_REQUESTS.errorCode,
        message: ERROR_TOO_MANY_REQUESTS.message,
      },
    })
    .addGlobalResponse({
      status: 500,
      description: ERROR_INTERNAL_SERVER.message,
      type: ErrorResponse,
      example: {
        statusCode: 500,
        errorCode: ERROR_INTERNAL_SERVER.errorCode,
        message: ERROR_INTERNAL_SERVER.message,
      },
    })
    .build();

  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);

  return { port, host };
}

bootstrap()
  .then(({ port, host }) => {
    bootstrapLogger.log(`Application is running on http://${host}:${port}`);
  })
  .catch((error) => {
    bootstrapLogger.error('An error occurred', error);
    process.exit(1);
  });
