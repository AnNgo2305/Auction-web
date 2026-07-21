import {
  IsArray,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsInt,
  Min,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DOCUMENT_MIME_TYPE,
  IMAGE_MIME_TYPE,
  UPLOAD_PURPOSE,
} from '@common/types/upload-file';
import type {
  ImageMimeType,
  UploadPurpose,
  DocumentMimeType,
} from '@common/types/upload-file';

const ALL_MIME_TYPES = [
  ...Object.values(IMAGE_MIME_TYPE),
  ...Object.values(DOCUMENT_MIME_TYPE),
];

export class FileMetadataDto {
  @IsIn(ALL_MIME_TYPES)
  mimeType: ImageMimeType | DocumentMimeType;

  @IsInt({ message: 'size must be an integer' })
  @Min(1, { message: 'size must be greater than 0' })
  size: number;

  @IsString({ message: 'fileName must be a string' })
  originalFileName: string;
}

export class PresignedUrlRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  files: FileMetadataDto[];

  @IsEnum(UPLOAD_PURPOSE, {
    message: 'Invalid upload purpose',
  })
  purpose: UploadPurpose;
}
