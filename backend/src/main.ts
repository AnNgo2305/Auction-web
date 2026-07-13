import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@common/services/logger.service';
import cookieParser from 'cookie-parser';

const bootstrapLogger = new LoggerService('Bootstrap');

async function bootstrap(): Promise<{
  port: string | number;
  host: number | string;
}> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: new LoggerService('NestFactory'),
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.use(cookieParser());

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
