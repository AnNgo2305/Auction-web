import { Module } from '@nestjs/common';
import { AllExceptionFilter } from '@common/filters/all-exception.filter';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggerService } from '@common/services/logger.service';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ValidationPipe } from '@common/pipes/validation.pipe';
import { TokenService } from '@common/services/token.service';
import { PasswordService } from '@common/services/password.service';
import { PrismaService } from '@common/services/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from '@common/services/mail.service';
import path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { JwtGuard } from '@common/guards/jwt.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserService } from '@modules/user/user.service';
import { FileService } from '@common/services/file.service';
import jwtConfig from '@common/config/jwt.config';
import passwordConfig from '@common/config/password.config';
import mailConfig from '@common/config/mail.config';
import s3Config from '@common/config/s3.config';
import redisConfig from '@common/config/redis.config';
import bullmqConfig from '@common/config/bullmq.config';
import { REDIS_CLIENT } from '@common/constants/redis.constant';
import Redis from 'ioredis';
import { WebsocketAuthService } from '@common/services/websocket-auth.service';
import { MailProcessor } from '@common/services/mail.processor';
import { ThrottlerModule as NestThrottlerModule } from '@nestjs/throttler/dist/throttler.module';
import { RedisThrottlerStorageModule } from '@common/throttler/redis-throttler-storage.module';
import rateLimitConfig from '@common/config/rate-limit.config';
import { RedisThrottlerStorageService } from '@common/throttler/redis-throttler-storage.service';
import {
  MAIL_QUEUE,
  MESSAGE_NOTIFICATION_QUEUE,
} from '@common/constants/queue.constant';
import { RateLimitService } from '@common/services/rate-limit.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RateLimitGuard } from '@common/guards/rate-limit.guard';
import { CsrfService } from '@common/services/csrf.service';
import { csrfConfig } from '@common/config/csrf.config';
import { UserCacheService } from '@common/cache/user.cache.service';
import { TokenBlacklistCacheService } from '@common/cache/token-blacklist.cache.service';
import { OtpCacheService } from '@common/cache/otp.cache.service';

const service = [
  LoggerService,
  TokenService,
  PasswordService,
  PrismaService,
  MailService,
  UserService,
  FileService,
  WebsocketAuthService,
  MailProcessor,
  RateLimitService,
  CsrfService,
  UserCacheService,
  TokenBlacklistCacheService,
  OtpCacheService,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        jwtConfig,
        passwordConfig,
        mailConfig,
        s3Config,
        redisConfig,
        bullmqConfig,
        rateLimitConfig,
        csrfConfig,
      ],
    }),
    JwtModule,
    EventEmitterModule.forRoot(),
    NestThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisThrottlerStorageModule],
      inject: [rateLimitConfig.KEY, RedisThrottlerStorageService],
      useFactory: (
        throttler: ConfigType<typeof rateLimitConfig>,
        storage: RedisThrottlerStorageService,
      ) => ({
        throttlers: [
          {
            name: 'short',
            ttl: throttler.short.ttl,
            limit: throttler.short.limit,
          },
          {
            name: 'medium',
            ttl: throttler.medium.ttl,
            limit: throttler.medium.limit,
          },
          {
            name: 'long',
            ttl: throttler.long.ttl,
            limit: throttler.long.limit,
          },
        ],
        storage,
      }),
    }),
    MailerModule.forRootAsync({
      inject: [mailConfig.KEY],
      useFactory: (mail: ConfigType<typeof mailConfig>) => {
        return {
          transport: {
            host: mail.host,
            port: mail.port,
            secure: mail.secure,
            auth: {
              user: mail.user,
              pass: mail.password,
            },
          },
          defaults: {
            from: `"Bid Market" <${mail.from}>`,
          },
          template: {
            dir: path.join(process.cwd(), 'src/common/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    BullModule.forRootAsync({
      inject: [redisConfig.KEY, bullmqConfig.KEY],
      useFactory: (
        redis: ConfigType<typeof redisConfig>,
        bullmq: ConfigType<typeof bullmqConfig>,
      ) => ({
        connection: {
          host: redis.host,
          port: redis.port,
          password: redis.password,
          db: redis.db,
        },
        defaultJobOptions: bullmq.defaultJobOptions,
      }),
    }),
    BullModule.registerQueue(
      { name: MAIL_QUEUE.NAME },
      { name: MESSAGE_NOTIFICATION_QUEUE.NAME },
    ),
  ],
  providers: [
    ...service,
    {
      provide: 'APP_FILTER',
      useClass: AllExceptionFilter,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_PIPE',
      useClass: ValidationPipe,
    },
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RateLimitGuard,
    },
    {
      provide: REDIS_CLIENT,
      inject: [redisConfig.KEY],
      useFactory: (redis: ConfigType<typeof redisConfig>) => {
        return new Redis({
          host: redis.host,
          port: redis.port,
          password: redis.password,
          db: redis.db,
        });
      },
    },
  ],
  exports: [...service, REDIS_CLIENT, BullModule],
})
export class CommonModule {}
