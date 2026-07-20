import { Module } from '@nestjs/common';
import { ProductDocumentController } from './product-document.controller';
import { ProductDocumentService } from './product-document.service';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ProductDocumentController],
  providers: [ProductDocumentService],
  exports: [ProductDocumentService],
})
export class ProductDocumentModule {}
