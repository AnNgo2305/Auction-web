import { Module } from '@nestjs/common';
import { ProductImageController } from './product-image.controller';
import { ProductImageService } from './product-image.service';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ProductImageController],
  providers: [ProductImageService],
  exports: [ProductImageService],
})
export class ProductImageModule {}
