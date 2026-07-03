import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileService } from '@common/services/file.service';
import { FileMetadata, UploadPurpose } from '@common/types/upload-file';
import {
  ERROR_FILE_TOO_LARGE,
  ERROR_FORBIDDEN_UPLOAD_PURPOSE,
  ERROR_INVALID_MIME_TYPE,
  ERROR_TOO_MANY_FILES,
  ERROR_UPLOAD_CONFIRM_FAILED,
  UPLOAD_RULES,
} from '@modules/upload/upload.constant';
import { PresignedUrlResponseDto } from '@modules/upload/dtos/create-presigned-upload-url.response.dto';
import { ConfirmUploadResponseDto } from '@modules/upload/dtos/confirm-upload.response.dto';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  private getRules(purpose: UploadPurpose): {
    maxSize: number;
    allowedMime: string[];
    maxFiles: number;
    roles: string[];
  } {
    return UPLOAD_RULES[purpose];
  }

  private validateFile(file: FileMetadata, purpose: UploadPurpose): void {
    const rules = this.getRules(purpose);

    if (!rules.allowedMime.includes(file.mimeType)) {
      this.logger.warn(`[UPLOAD] Invalid mime type: ${file.mimeType}`);
      throw new BadRequestException(ERROR_INVALID_MIME_TYPE);
    }

    if (file.size > rules.maxSize) {
      this.logger.warn(
        `[UPLOAD] File too large: ${file.originalFileName}, size=${file.size}, limit=${rules.maxSize}`,
      );
      throw new BadRequestException(ERROR_FILE_TOO_LARGE);
    }
  }

  private validatePermission(purpose: UploadPurpose, role: string): void {
    const rules = this.getRules(purpose);

    if (!rules.roles.includes(role)) {
      this.logger.warn(
        `[UPLOAD] Permission denied. role=${role}, purpose=${purpose}`,
      );
      throw new BadRequestException(ERROR_FORBIDDEN_UPLOAD_PURPOSE);
    }
  }

  async createPresignedUploadUrl(
    userId: string,
    role: string,
    files: FileMetadata[],
    purpose: UploadPurpose,
  ): Promise<PresignedUrlResponseDto> {
    this.logger.log(
      `[UPLOAD] Create presigned URLs requested by user=${userId}, purpose=${purpose}`,
    );

    this.logger.logJson('[UPLOAD] Request payload', {
      userId,
      role,
      purpose,
      files,
    });

    const rules = this.getRules(purpose);

    this.validatePermission(purpose, role);

    if (files.length > rules.maxFiles) {
      this.logger.warn(
        `[UPLOAD] Too many files: received=${files.length}, allowed=${rules.maxFiles}`,
      );
      throw new BadRequestException(ERROR_TOO_MANY_FILES);
    }

    files.forEach((file) => this.validateFile(file, purpose));

    const urls = await this.fileService.createPresignedUploadUrl(
      userId,
      files,
      purpose,
    );

    this.logger.log(
      `[UPLOAD] Generated ${urls.length} presigned URL(s) successfully`,
    );

    this.logger.logJson('[UPLOAD] Presigned URLs', urls);

    return { urls };
  }

  async confirmUpload(keys: string[]): Promise<ConfirmUploadResponseDto> {
    if (!keys.length) return { files: [] };

    const files = await Promise.all(
      keys.map(async (key) => {
        try {
          const head = await this.fileService.headObject(key);

          return {
            key,
            exists: true,
            size: head.ContentLength,
          };
        } catch {
          return {
            key,
            exists: false,
          };
        }
      }),
    );

    const missing = files.filter((r) => !r.exists);

    if (missing.length > 0) {
      throw new InternalServerErrorException(ERROR_UPLOAD_CONFIRM_FAILED);
    }

    return { files };
  }
}
