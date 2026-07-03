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

const service = [
  LoggerService,
  TokenService,
  PasswordService,
  PrismaService,
  MailService,
  UserService,
  FileService,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, passwordConfig, mailConfig, s3Config],
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
  ],
  exports: [...service],
})
export class CommonModule {}
