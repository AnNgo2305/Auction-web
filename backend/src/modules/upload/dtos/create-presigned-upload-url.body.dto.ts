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
import { ApiProperty } from '@nestjs/swagger';

const ALL_MIME_TYPES = [
  ...Object.values(IMAGE_MIME_TYPE),
  ...Object.values(DOCUMENT_MIME_TYPE),
];

export class FileMetadataDto {
  @IsIn(ALL_MIME_TYPES)
  @ApiProperty({
    description: 'MIME type of the file',
    enum: ALL_MIME_TYPES,
    example: IMAGE_MIME_TYPE.JPEG,
  })
  mimeType: ImageMimeType | DocumentMimeType;

  @ApiProperty({
    description: 'File size in bytes',
    minimum: 1,
    example: 245760,
  })
  @IsInt({ message: 'size must be an integer' })
  @Min(1, { message: 'size must be greater than 0' })
  size: number;

  @ApiProperty({
    description: 'Original file name',
    example: 'profile.jpg',
  })
  @IsString({ message: 'fileName must be a string' })
  originalFileName: string;
}

export class PresignedUrlRequestDto {
  @ApiProperty({
    description: 'Files to generate presigned upload URLs for',
    type: [FileMetadataDto],
    minItems: 1,
    maxItems: 5,
    example: [
      {
        mimeType: IMAGE_MIME_TYPE.JPEG,
        size: 245760,
        originalFileName: 'profile.jpg',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  files: FileMetadataDto[];

  @ApiProperty({
    description: 'Purpose of the upload',
    enum: UPLOAD_PURPOSE,
    example: UPLOAD_PURPOSE.AVATAR,
  })
  @IsEnum(UPLOAD_PURPOSE, {
    message: 'Invalid upload purpose',
  })
  purpose: UploadPurpose;
}
