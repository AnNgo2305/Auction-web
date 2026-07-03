import {
  IsArray,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UploadPurpose } from '@common/types/upload-file';

export class FileMetadataDto {
  @IsEnum(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
  mimeType: string;

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

  @IsEnum(['avatar', 'cover'])
  purpose: UploadPurpose;
}
