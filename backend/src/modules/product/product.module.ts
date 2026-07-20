import { Module } from '@nestjs/common';
import { ProductService } from '@modules/product/product.service';
import { ProductController } from '@modules/product/product.controller';
import { CommonModule } from '@common/common.module';
import { ProductCategoryModule } from '@modules/product-category/product-category.module';

@Module({
  imports: [CommonModule, ProductCategoryModule],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
