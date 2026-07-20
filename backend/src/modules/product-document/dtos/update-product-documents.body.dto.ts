import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ProductDocumentDto {
  @IsNotEmpty({
    message: 'Document name is required.',
  })
  @IsString({
    message: 'Document name must be a string.',
  })
  @MaxLength(255, {
    message: 'Document name must not exceed 255 characters.',
  })
  documentName: string;

  @IsNotEmpty({
    message: 'Document key is required.',
  })
  @IsString({
    message: 'Document key must be a string.',
  })
  @MaxLength(255, {
    message: 'Document key must not exceed 255 characters.',
  })
  documentKey: string;
}

export class UpdateProductDocumentsDto {
  @IsArray({
    message: 'Documents must be an array.',
  })
  @ArrayMaxSize(10, {
    message: 'A product can have at most 10 documents.',
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductDocumentDto)
  documents: ProductDocumentDto[];
}
