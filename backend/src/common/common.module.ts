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

const service = [
  LoggerService,
  TokenService,
  PasswordService,
  PrismaService,
  MailService,
  UserService,
  FileService,
  WebsocketAuthService,
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
      ],
    }),
    JwtModule,
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
  exports: [...service],
})
export class CommonModule {}
