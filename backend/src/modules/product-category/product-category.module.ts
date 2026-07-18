import { Module } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CommonModule } from '@common/common.module';
import { ProductCategoryController } from '@modules/product-category/product-category.controller';

@Module({
  imports: [CommonModule],
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
  controllers: [ProductCategoryController],
})
export class ProductCategoryModule {}
