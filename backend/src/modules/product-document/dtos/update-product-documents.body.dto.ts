import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MAX_PRODUCT_DOCUMENTS } from '@modules/product/product.constant';

export class ProductDocumentDto {
  @ApiProperty({
    description: 'Display name of the product document',
    example: 'Product Manual.pdf',
    maxLength: 255,
  })
  @IsNotEmpty({
    message: 'Document name is required.',
  })
  @IsString({
    message: 'Document name must be a string.',
  })
  @MaxLength(255, {
    message: 'Document name must not exceed 255 characters.',
  })
  documentName!: string;

  @ApiProperty({
    description: 'Storage key of the product document',
    example:
      'products/018f3c5e-7b3a-7abc-8def-1234567890ab/documents/manual.pdf',
    maxLength: 255,
  })
  @IsNotEmpty({
    message: 'Document key is required.',
  })
  @IsString({
    message: 'Document key must be a string.',
  })
  @MaxLength(255, {
    message: 'Document key must not exceed 255 characters.',
  })
  documentKey!: string;
}

export class UpdateProductDocumentsDto {
  @ApiProperty({
    description: 'Documents to associate with the product',
    type: [ProductDocumentDto],
    maxItems: MAX_PRODUCT_DOCUMENTS,
    example: [
      {
        documentName: 'Product Manual.pdf',
        documentKey:
          'products/018f3c5e-7b3a-7abc-8def-1234567890ab/documents/manual.pdf',
      },
      {
        documentName: 'Warranty Terms.pdf',
        documentKey:
          'products/018f3c5e-7b3a-7abc-8def-1234567890ab/documents/warranty.pdf',
      },
    ],
  })
  @IsArray({
    message: 'Documents must be an array.',
  })
  @ArrayMaxSize(MAX_PRODUCT_DOCUMENTS, {
    message: `A product can have at most ${MAX_PRODUCT_DOCUMENTS} documents.`,
  })
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductDocumentDto)
  documents!: ProductDocumentDto[];
}
