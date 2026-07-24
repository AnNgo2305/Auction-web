import { Module } from '@nestjs/common';
import { ProductCommentController } from '@modules/product-comment/product-comment.controller';
import { ProductCommentService } from '@modules/product-comment/product-comment.service';
import { PermissionModule } from '@modules/permission/permission.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule, PermissionModule],
  controllers: [ProductCommentController],
  providers: [ProductCommentService],
  exports: [ProductCommentService],
})
export class ProductCommentModule {}
