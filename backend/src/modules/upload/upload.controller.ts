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
import { Throttle } from '@nestjs/throttler';
import { CreatePresignedDownloadUrlsRequestDto } from '@modules/upload/dtos/create-presigned-download-url.body.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PresignedUrlResponseDto } from '@modules/upload/dtos/create-presigned-upload-url.response.dto';
import { ErrorResponse, SuccessResponse } from '@common/types/response.dto';
import {
  ERROR_FILE_TOO_LARGE,
  ERROR_FORBIDDEN_UPLOAD_PURPOSE,
  ERROR_INVALID_MIME_TYPE,
  ERROR_TOO_MANY_FILES,
  ERROR_UPLOAD_CONFIRM_FAILED,
} from '@modules/upload/upload.constant';
import { CreatePresignedDownloadUrlsResponseDto } from '@modules/upload/dtos/create-presigned-download-url.response.dto';
import { ConfirmUploadResponseDto } from '@modules/upload/dtos/confirm-upload.response.dto';

@ApiTags('Upload')
@ApiExtraModels(
  SuccessResponse,
  ErrorResponse,
  PresignedUrlResponseDto,
  CreatePresignedDownloadUrlsResponseDto,
  ConfirmUploadResponseDto,
)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-urls')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 5 },
    long: { ttl: 60_000, limit: 15 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create presigned upload URLs',
    description:
      'Creates presigned URLs for uploading files to storage after validating the upload purpose, user role, file type, file size, and file count.',
  })
  @ApiBody({ type: PresignedUrlRequestDto })
  @ApiOkResponse({
    description: 'Presigned URLs created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(PresignedUrlResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Presigned URLs created successfully',
      data: {
        urls: [
          {
            key: 'users/550e8400-e29b-41d4-a716-446655440000/avatar/image.jpg',
            url: 'https://storage.example.com/presigned-upload-url',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid upload request',
    type: ErrorResponse,
    examples: {
      invalidMimeType: {
        summary: 'Invalid file MIME type',
        value: ERROR_INVALID_MIME_TYPE,
      },
      fileTooLarge: {
        summary: 'File size exceeds limit',
        value: ERROR_FILE_TOO_LARGE,
      },
      tooManyFiles: { summary: 'Too many files', value: ERROR_TOO_MANY_FILES },
    },
  })
  @ApiForbiddenResponse({
    description: ERROR_FORBIDDEN_UPLOAD_PURPOSE.message,
    type: ErrorResponse,
    example: ERROR_FORBIDDEN_UPLOAD_PURPOSE,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
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

  @Post('presigned-download-urls')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 5 },
    medium: { ttl: 10_000, limit: 20 },
    long: { ttl: 60_000, limit: 60 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create presigned download URLs',
    description:
      'Creates presigned URLs for downloading files from storage using their object keys.',
  })
  @ApiBody({ type: CreatePresignedDownloadUrlsRequestDto })
  @ApiOkResponse({
    description: 'Presigned download URLs created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(CreatePresignedDownloadUrlsResponseDto),
            },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Presigned download URLs created successfully',
      data: {
        urls: {
          'users/avatar/image.jpg':
            'https://storage.example.com/presigned-download-url',
        },
      },
    },
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
  async getPresignedDownloadUrls(
    @Body() dto: CreatePresignedDownloadUrlsRequestDto,
  ): Promise<ResponsePayload> {
    const { keys } = dto;

    const res = await this.uploadService.createPresignedDownloadUrls(keys);

    return {
      message: 'Presigned download URLs created successfully',
      data: res,
    };
  }

  @Post('confirm')
  @Auth(AuthType.ACCESS_TOKEN)
  @Throttle({
    short: { ttl: 1_000, limit: 2 },
    medium: { ttl: 10_000, limit: 10 },
    long: { ttl: 60_000, limit: 35 },
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm uploaded files',
    description:
      'Checks whether the specified files exist in storage and returns their public URLs and sizes.',
  })
  @ApiBody({ type: ConfirmUploadRequestDto })
  @ApiOkResponse({
    description: 'Upload confirmation completed',
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(ConfirmUploadResponseDto) },
          },
        },
      ],
    },
    example: {
      statusCode: 200,
      message: 'Upload confirmation completed',
      data: {
        files: [
          {
            key: 'users/avatar/image.jpg',
            url: 'https://example.com/files/image.jpg',
            exists: true,
            size: 245678,
          },
        ],
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: ERROR_UPLOAD_CONFIRM_FAILED.message,
    type: ErrorResponse,
    example: ERROR_UPLOAD_CONFIRM_FAILED,
  })
  @ApiCookieAuth('access_token')
  @ApiSecurity('csrf-token')
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
