import { Module } from '@nestjs/common';
import { ProductImageController } from './product-image.controller';
import { ProductImageService } from './product-image.service';
import { CommonModule } from '@common/common.module';
import { PermissionModule } from '@modules/permission/permission.module';

@Module({
  imports: [CommonModule, PermissionModule],
  controllers: [ProductImageController],
  providers: [ProductImageService],
  exports: [ProductImageService],
})
export class ProductImageModule {}
