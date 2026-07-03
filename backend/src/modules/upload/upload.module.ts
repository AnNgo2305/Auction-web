import { Module } from '@nestjs/common';
import { UploadController } from '@modules/upload/upload.controller';
import { CommonModule } from '@common/common.module';
import { UploadService } from '@modules/upload/upload.service';

@Module({
  imports: [CommonModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
