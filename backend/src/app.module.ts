import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from '@common/common.module';
import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { RequestIdMiddleware } from '@common/middlewares/request-id.middleware';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RefreshTokenModule } from '@modules/refresh-token/refresh-token.module';
import { FollowModule } from '@modules/follow/follow.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { AddressModule } from '@modules/address/address.module';
import { ProductModule } from '@modules/product/product.module';
import { UploadModule } from '@modules/upload/upload.module';
import { ProductCategoryModule } from '@modules/product-category/product-category.module';
import { ProductImageModule } from '@modules/product-image/product-image.module';
import { ProductDocumentModule } from '@modules/product-document/product-document.module';

@Module({
  imports: [
    CommonModule,
    UserModule,
    AuthModule,
    RefreshTokenModule,
    FollowModule,
    ProfileModule,
    AddressModule,
    ProductModule,
    UploadModule,
    ProductCategoryModule,
    ProductImageModule,
    ProductDocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
