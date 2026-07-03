import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthType } from '@common/types/auth-type.enum';
import { Request } from 'express';
import { PresignedUrlRequestDto } from '@modules/upload/dtos/create-presigned-upload-url.body.dto';
import { ResponsePayload } from '@common/types/response.interface';
import { UploadService } from '@modules/upload/upload.service';
import { ConfirmUploadRequestDto } from '@modules/upload/dtos/confirm-upload.body.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-urls')
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async getPresignedUrls(
    @Req() req: Request,
    @Body() dto: PresignedUrlRequestDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as string;
    const role = req.user?.role as string;
    const { files, purpose } = dto;

    const res = await this.uploadService.createPresignedUploadUrl(
      userId,
      role,
      files,
      purpose,
    );

    return {
      message: 'Presigned URLs created successfully',
      data: res,
    };
  }

  @Post('confirm')
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @Body() body: ConfirmUploadRequestDto,
  ): Promise<ResponsePayload> {
    const { keys } = body;

    const res = await this.uploadService.confirmUpload(keys);

    return {
      message: 'Upload confirmation completed',
      data: res,
    };
  }
}
